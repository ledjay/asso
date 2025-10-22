import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database/client";
import { z } from "zod";

// Validation schema for member update (many-to-many)
const updateMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  groupIds: z.array(z.string()).min(1, "At least one group is required"),
});

/**
 * GET /api/members/[id]
 * Get a single member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
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

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/members/[id]
 * Update a member
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validation = updateMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid member data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, roleIds, groupIds } = validation.data;

    // Check if email is already taken by another member (case-insensitive)
    const existingMember = await prisma.member.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
        NOT: { id },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Email already in use by another member" },
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

    // Update member with junction tables in transaction
    const updatedMember = await prisma.$transaction(async (tx) => {
      // Update basic member info
      const member = await tx.member.update({
        where: { id },
        data: {
          name,
          email,
        },
      });

      // Delete existing role associations
      await tx.memberRole.deleteMany({
        where: { memberId: id },
      });

      // Create new role associations
      await tx.memberRole.createMany({
        data: roleIds.map((roleId) => ({
          memberId: id,
          roleId,
        })),
      });

      // Delete existing group associations
      await tx.memberGroup.deleteMany({
        where: { memberId: id },
      });

      // Create new group associations
      await tx.memberGroup.createMany({
        data: groupIds.map((groupId) => ({
          memberId: id,
          groupId,
        })),
      });

      // Return member with associations
      return tx.member.findUnique({
        where: { id },
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
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/members/[id]
 * Delete a member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Hard delete for MVP (soft delete deferred to post-MVP)
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
