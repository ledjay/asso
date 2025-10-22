import { prisma } from "./client";

/**
 * Group Hierarchy Validation Utilities
 * Ensures hierarchical group structures maintain integrity:
 * - Maximum 3 levels of depth
 * - No circular references
 * - Efficient descendant queries for filtering
 */

const MAX_DEPTH = 3;

/**
 * Validates that a group hierarchy does not exceed maximum depth
 * @param parentId - The proposed parent ID (null for root groups)
 * @returns Validation result with current depth and error message if invalid
 */
export async function validateGroupDepth(
  parentId: string | null
): Promise<{ valid: boolean; currentDepth: number; error?: string }> {
  // Root groups (no parent) are always valid
  if (!parentId) {
    return { valid: true, currentDepth: 1 };
  }

  // Calculate depth by traversing up the parent chain
  let currentDepth = 1;
  let currentParentId: string | null = parentId;

  while (currentParentId) {
    currentDepth++;

    if (currentDepth > MAX_DEPTH) {
      return {
        valid: false,
        currentDepth,
        error: `Maximum depth of ${MAX_DEPTH} levels exceeded`,
      };
    }

    // Get the parent's parent
    const parent: { parentId: string | null } | null = await prisma.groupType.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });

    if (!parent) {
      return {
        valid: false,
        currentDepth,
        error: "Parent group not found",
      };
    }

    currentParentId = parent.parentId;
  }

  return { valid: true, currentDepth };
}

/**
 * Validates that setting a parent does not create a circular reference
 * @param groupId - The group ID being updated
 * @param parentId - The proposed parent ID
 * @returns true if no circular reference, false otherwise
 */
export async function validateNoCircularReference(
  groupId: string,
  parentId: string | null
): Promise<{ valid: boolean; error?: string }> {
  // No parent means no circular reference possible
  if (!parentId) {
    return { valid: true };
  }

  // A group cannot be its own parent
  if (groupId === parentId) {
    return {
      valid: false,
      error: "A group cannot be its own parent",
    };
  }

  // Check if the proposed parent is a descendant of this group
  const descendants = await getAllDescendantIds(groupId);

  if (descendants.includes(parentId)) {
    return {
      valid: false,
      error: "Cannot set a descendant as parent (circular reference)",
    };
  }

  return { valid: true };
}

/**
 * Gets all descendant group IDs for a given group (recursive)
 * Used for filtering members by parent group + all children
 * @param groupId - The parent group ID
 * @returns Array of descendant group IDs (does not include the parent itself)
 */
export async function getAllDescendantIds(groupId: string): Promise<string[]> {
  const descendants: string[] = [];
  const queue: string[] = [groupId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // Get direct children
    const children = await prisma.groupType.findMany({
      where: { parentId: currentId },
      select: { id: true },
    });

    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id); // Add to queue for recursive traversal
    }
  }

  return descendants;
}

/**
 * Gets the full hierarchy path for a group (from root to current)
 * Useful for displaying breadcrumbs or full group names
 * @param groupId - The group ID
 * @returns Array of group objects from root to current (ordered)
 */
export async function getGroupHierarchyPath(
  groupId: string
): Promise<Array<{ id: string; name: string; category: string }>> {
  const path: Array<{ id: string; name: string; category: string }> = [];
  let currentId: string | null = groupId;

  while (currentId) {
    const group: { id: string; name: string; category: string; parentId: string | null } | null = await prisma.groupType.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, category: true, parentId: true },
    });

    if (!group) break;

    path.unshift({
      id: group.id,
      name: group.name,
      category: group.category,
    });

    currentId = group.parentId;
  }

  return path;
}

/**
 * Validates a complete group hierarchy operation
 * Combines depth and circular reference checks
 * @param groupId - The group ID being created/updated (null for new groups)
 * @param parentId - The proposed parent ID
 * @returns Validation result with detailed error messages
 */
export async function validateGroupHierarchy(
  groupId: string | null,
  parentId: string | null
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check depth
  const depthResult = await validateGroupDepth(parentId);
  if (!depthResult.valid && depthResult.error) {
    errors.push(depthResult.error);
  }

  // Check circular reference (only for existing groups)
  if (groupId) {
    const circularResult = await validateNoCircularReference(groupId, parentId);
    if (!circularResult.valid && circularResult.error) {
      errors.push(circularResult.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
