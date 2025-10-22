import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { validateGroupHierarchy } from '@repo/database/group-hierarchy';
import { z } from 'zod';

// Validation schema for group creation
const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  parentId: z.string().nullable(),
});

/**
 * POST /api/groups
 * Create a new group with hierarchy validation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createGroupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid group data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, category, parentId } = validation.data;

    // Check if group name already exists
    const existingGroup = await prisma.groupType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Un groupe avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Validate hierarchy if parent is specified
    if (parentId) {
      const validation = await validateGroupHierarchy(parentId, null);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors.join(', ') },
          { status: 400 }
        );
      }
    }

    // Create group
    const newGroup = await prisma.groupType.create({
      data: {
        name,
        category,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      success: true,
      group: newGroup,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
