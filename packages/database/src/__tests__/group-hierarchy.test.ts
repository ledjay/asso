/**
 * Tests for group hierarchy validation utilities
 * Run with: pnpm test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../client';
import {
  validateGroupDepth,
  validateNoCircularReference,
  getAllDescendantIds,
  getGroupHierarchyPath,
  validateGroupHierarchy,
} from '../group-hierarchy';

describe('Group Hierarchy Utilities', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.memberGroup.deleteMany();
    await prisma.memberRole.deleteMany();
    await prisma.member.deleteMany();
    await prisma.groupType.deleteMany();
  });

  describe('validateGroupDepth', () => {
    it('should allow root groups (no parent)', async () => {
      const result = await validateGroupDepth(null);
      expect(result.valid).toBe(true);
      expect(result.currentDepth).toBe(1);
    });

    it('should allow 2-level hierarchy', async () => {
      const parent = await prisma.groupType.create({
        data: { name: 'Parent', category: 'test' },
      });

      const result = await validateGroupDepth(parent.id);
      expect(result.valid).toBe(true);
      expect(result.currentDepth).toBe(2);
    });

    it('should allow 3-level hierarchy (max)', async () => {
      const level1 = await prisma.groupType.create({
        data: { name: 'Level1', category: 'test' },
      });
      const level2 = await prisma.groupType.create({
        data: { name: 'Level2', category: 'test', parentId: level1.id },
      });

      const result = await validateGroupDepth(level2.id);
      expect(result.valid).toBe(true);
      expect(result.currentDepth).toBe(3);
    });

    it('should reject 4-level hierarchy', async () => {
      const level1 = await prisma.groupType.create({
        data: { name: 'Level1', category: 'test' },
      });
      const level2 = await prisma.groupType.create({
        data: { name: 'Level2', category: 'test', parentId: level1.id },
      });
      const level3 = await prisma.groupType.create({
        data: { name: 'Level3', category: 'test', parentId: level2.id },
      });

      const result = await validateGroupDepth(level3.id);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum depth');
    });
  });

  describe('validateNoCircularReference', () => {
    it('should reject self-reference', async () => {
      const group = await prisma.groupType.create({
        data: { name: 'Group', category: 'test' },
      });

      const result = await validateNoCircularReference(group.id, group.id);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be its own parent');
    });

    it('should reject circular reference (child as parent)', async () => {
      const parent = await prisma.groupType.create({
        data: { name: 'Parent', category: 'test' },
      });
      const child = await prisma.groupType.create({
        data: { name: 'Child', category: 'test', parentId: parent.id },
      });

      // Try to set child as parent of parent (circular)
      const result = await validateNoCircularReference(parent.id, child.id);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('circular reference');
    });

    it('should allow valid parent assignment', async () => {
      const parent = await prisma.groupType.create({
        data: { name: 'Parent', category: 'test' },
      });
      const child = await prisma.groupType.create({
        data: { name: 'Child', category: 'test' },
      });

      const result = await validateNoCircularReference(child.id, parent.id);
      expect(result.valid).toBe(true);
    });
  });

  describe('getAllDescendantIds', () => {
    it('should return empty array for leaf groups', async () => {
      const leaf = await prisma.groupType.create({
        data: { name: 'Leaf', category: 'test' },
      });

      const descendants = await getAllDescendantIds(leaf.id);
      expect(descendants).toEqual([]);
    });

    it('should return direct children', async () => {
      const parent = await prisma.groupType.create({
        data: { name: 'Parent', category: 'test' },
      });
      const child1 = await prisma.groupType.create({
        data: { name: 'Child1', category: 'test', parentId: parent.id },
      });
      const child2 = await prisma.groupType.create({
        data: { name: 'Child2', category: 'test', parentId: parent.id },
      });

      const descendants = await getAllDescendantIds(parent.id);
      expect(descendants).toHaveLength(2);
      expect(descendants).toContain(child1.id);
      expect(descendants).toContain(child2.id);
    });

    it('should return all descendants recursively', async () => {
      const level1 = await prisma.groupType.create({
        data: { name: 'Level1', category: 'test' },
      });
      const level2 = await prisma.groupType.create({
        data: { name: 'Level2', category: 'test', parentId: level1.id },
      });
      const level3 = await prisma.groupType.create({
        data: { name: 'Level3', category: 'test', parentId: level2.id },
      });

      const descendants = await getAllDescendantIds(level1.id);
      expect(descendants).toHaveLength(2);
      expect(descendants).toContain(level2.id);
      expect(descendants).toContain(level3.id);
    });
  });

  describe('getGroupHierarchyPath', () => {
    it('should return single item for root group', async () => {
      const root = await prisma.groupType.create({
        data: { name: 'Root', category: 'test' },
      });

      const path = await getGroupHierarchyPath(root.id);
      expect(path).toHaveLength(1);
      expect(path[0].name).toBe('Root');
    });

    it('should return full path from root to leaf', async () => {
      const level1 = await prisma.groupType.create({
        data: { name: 'Level1', category: 'cat1' },
      });
      const level2 = await prisma.groupType.create({
        data: { name: 'Level2', category: 'cat2', parentId: level1.id },
      });
      const level3 = await prisma.groupType.create({
        data: { name: 'Level3', category: 'cat3', parentId: level2.id },
      });

      const path = await getGroupHierarchyPath(level3.id);
      expect(path).toHaveLength(3);
      expect(path[0].name).toBe('Level1');
      expect(path[1].name).toBe('Level2');
      expect(path[2].name).toBe('Level3');
    });
  });

  describe('validateGroupHierarchy', () => {
    it('should validate complete hierarchy', async () => {
      const parent = await prisma.groupType.create({
        data: { name: 'Parent', category: 'test' },
      });

      const result = await validateGroupHierarchy(null, parent.id);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return all validation errors', async () => {
      const level1 = await prisma.groupType.create({
        data: { name: 'Level1', category: 'test' },
      });
      const level2 = await prisma.groupType.create({
        data: { name: 'Level2', category: 'test', parentId: level1.id },
      });
      const level3 = await prisma.groupType.create({
        data: { name: 'Level3', category: 'test', parentId: level2.id },
      });

      // Try to add level4 (exceeds depth) and create circular reference
      const result = await validateGroupHierarchy(level1.id, level3.id);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
