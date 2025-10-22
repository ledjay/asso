import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database/client';
import { validateGroupHierarchy } from '@repo/database/group-hierarchy';
import { z } from 'zod';

// Validation schema for group update
const updateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  parentId: z.string().nullable(),
});

/**
 * PATCH /api/groups/[id]
 * Update a group with hierarchy validation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validation = updateGroupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid group data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, category, parentId } = validation.data;

    // Check if group exists
    const existingGroup = await prisma.groupType.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if name is taken by another group
    const duplicateName = await prisma.groupType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        NOT: { id },
      },
    });

    if (duplicateName) {
      return NextResponse.json(
        { error: 'Un groupe avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Validate hierarchy if parent is specified or changed
    if (parentId) {
      const validation = await validateGroupHierarchy(parentId, id);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.errors.join(', ') },
          { status: 400 }
        );
      }
    }

    // Update group
    const updatedGroup = await prisma.groupType.update({
      where: { id },
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
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a group (only if it has no members or children)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if group exists
    const group = await prisma.groupType.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Prevent deletion if group has members
    if (group._count.members > 0) {
      return NextResponse.json(
        { error: `Ce groupe contient ${group._count.members} membre(s). Veuillez d'abord les réassigner.` },
        { status: 400 }
      );
    }

    // Prevent deletion if group has children
    if (group.children.length > 0) {
      return NextResponse.json(
        { error: `Ce groupe a ${group.children.length} sous-groupe(s). Veuillez d'abord les supprimer ou réassigner.` },
        { status: 400 }
      );
    }

    // Delete group
    await prisma.groupType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
