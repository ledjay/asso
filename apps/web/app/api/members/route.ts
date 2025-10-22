import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database/client";
import { z } from "zod";

// Validation schema for member creation (many-to-many)
const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  groupIds: z.array(z.string()).min(1, "At least one group is required"),
});

/**
 * POST /api/members
 * Create a new member
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid member data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, roleIds, groupIds } = validation.data;

    // Check if email already exists (case-insensitive)
    const existingMember = await prisma.member.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Verify all roles and groups exist
    const [roles, groups] = await Promise.all([
      prisma.role.findMany({ where: { id: { in: roleIds } } }),
      prisma.groupType.findMany({ where: { id: { in: groupIds } } }),
    ]);

    if (roles.length !== roleIds.length) {
      return NextResponse.json({ error: "One or more invalid roles" }, { status: 400 });
    }

    if (groups.length !== groupIds.length) {
      return NextResponse.json({ error: "One or more invalid groups" }, { status: 400 });
    }

    // Create member with junction tables in transaction
    const newMember = await prisma.$transaction(async (tx) => {
      // Create member
      const member = await tx.member.create({
        data: {
          name,
          email,
        },
      });

      // Create role associations
      await tx.memberRole.createMany({
        data: roleIds.map((roleId) => ({
          memberId: member.id,
          roleId,
        })),
      });

      // Create group associations
      await tx.memberGroup.createMany({
        data: groupIds.map((groupId) => ({
          memberId: member.id,
          groupId,
        })),
      });

      // Return member with associations
      return tx.member.findUnique({
        where: { id: member.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          groups: {
            include: {
              group: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      member: newMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
