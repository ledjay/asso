# Migration Guide: Many-to-Many Roles and Hierarchical Groups

## Overview

This migration changes the data model from:
- **Current**: One member → One role + One group (flat structure)
- **New**: One member → Multiple roles + Multiple groups (with hierarchical groups)

## Database Schema Changes

### New Junction Tables

1. **MemberRole** - Links members to roles (many-to-many)
   - `memberId` + `roleId` (unique constraint)
   - `assignedAt` timestamp

2. **MemberGroup** - Links members to groups (many-to-many)
   - `memberId` + `groupId` (unique constraint)
   - `joinedAt` timestamp

### Added Fields to GroupType

- `parentId` (nullable) - References parent group for hierarchy
- `parent` relation - Self-referential parent group
- `children` relation - Self-referential child groups

### Removed Fields from Member

- `roleId` (replaced by `MemberRole` junction table)
- `groupId` (replaced by `MemberGroup` junction table)

## Hierarchical Group Examples

### Use Cases

1. **School Classes**:
   ```
   6ème (parent)
   ├── 6ème 1 (child)
   ├── 6ème 2 (child)
   └── 6ème 3 (child)
   ```

2. **Sports Teams**:
   ```
   Football (parent)
   ├── U12 (child)
   │   ├── Équipe A (grandchild)
   │   └── Équipe B (grandchild)
   └── U15 (child)
   ```

3. **Departments**:
   ```
   Musique (parent)
   ├── Piano (child)
   ├── Guitare (child)
   └── Chant (child)
   ```

### Query Examples

**Get group with all children:**
```typescript
const groupWithChildren = await prisma.groupType.findUnique({
  where: { id: parentGroupId },
  include: {
    children: true,
  },
});
```

**Get group with parent:**
```typescript
const groupWithParent = await prisma.groupType.findUnique({
  where: { id: childGroupId },
  include: {
    parent: true,
  },
});
```

**Get full hierarchy:**
```typescript
const fullHierarchy = await prisma.groupType.findUnique({
  where: { id: groupId },
  include: {
    parent: {
      include: {
        parent: true, // Grandparent
      },
    },
    children: {
      include: {
        children: true, // Grandchildren
      },
    },
  },
});
```

## Migration Steps

### 1. Backup Current Data

```bash
# Export current members
cd packages/database
npx prisma db pull
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 2. Create Data Migration Script

Before applying the schema change, create a migration script to preserve existing data:

```sql
-- Create junction tables
CREATE TABLE "MemberRole" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MemberRole_memberId_roleId_key" UNIQUE ("memberId", "roleId")
);

CREATE TABLE "MemberGroup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MemberGroup_memberId_groupId_key" UNIQUE ("memberId", "groupId")
);

-- Migrate existing data
INSERT INTO "MemberRole" ("id", "memberId", "roleId", "assignedAt")
SELECT gen_random_uuid()::text, "id", "roleId", "createdAt"
FROM "Member";

INSERT INTO "MemberGroup" ("id", "memberId", "groupId", "joinedAt")
SELECT gen_random_uuid()::text, "id", "groupId", "createdAt"
FROM "Member";

-- Add foreign keys
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_memberId_fkey" 
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE;
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE;

ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_memberId_fkey" 
  FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE;
ALTER TABLE "MemberGroup" ADD CONSTRAINT "MemberGroup_groupId_fkey" 
  FOREIGN KEY ("groupId") REFERENCES "GroupType"("id") ON DELETE CASCADE;

-- Create indexes
CREATE INDEX "MemberRole_memberId_idx" ON "MemberRole"("memberId");
CREATE INDEX "MemberRole_roleId_idx" ON "MemberRole"("roleId");
CREATE INDEX "MemberGroup_memberId_idx" ON "MemberGroup"("memberId");
CREATE INDEX "MemberGroup_groupId_idx" ON "MemberGroup"("groupId");

-- Remove old columns (after verifying data migration)
ALTER TABLE "Member" DROP COLUMN "roleId";
ALTER TABLE "Member" DROP COLUMN "groupId";
```

### 3. Apply Prisma Schema Changes

```bash
# Replace current schema
cp packages/database/prisma/schema-many-to-many.prisma packages/database/prisma/schema.prisma

# Generate new Prisma client
cd packages/database
npx prisma generate

# Create migration (will detect changes)
npx prisma migrate dev --name many_to_many_roles_groups
```

### 4. Update Application Code

#### CSV Import Changes

**Old format:**
```csv
nom,email,role,groupe
Jean Dupont,jean@example.com,delegue_titulaire,6e1
```

**New format (option 1 - single role/group):**
```csv
nom,email,role,groupe
Jean Dupont,jean@example.com,delegue_titulaire,6e1
```

**New format (option 2 - multiple roles/groups):**
```csv
nom,email,roles,groupes
Jean Dupont,jean@example.com,"delegue_titulaire,membre","6e1,5e2"
```

#### API Changes

**Member Creation:**
```typescript
// Old
await prisma.member.create({
  data: {
    name,
    email,
    roleId,
    groupId,
  },
});

// New
await prisma.member.create({
  data: {
    name,
    email,
    roles: {
      create: roleIds.map(roleId => ({ roleId })),
    },
    groups: {
      create: groupIds.map(groupId => ({ groupId })),
    },
  },
});
```

**Member Query:**
```typescript
// Old
const member = await prisma.member.findUnique({
  where: { id },
  include: {
    role: true,
    group: true,
  },
});

// New
const member = await prisma.member.findUnique({
  where: { id },
  include: {
    roles: {
      include: { role: true },
    },
    groups: {
      include: { group: true },
    },
  },
});
```

#### UI Changes

**Member Table:**
- Display multiple role badges instead of single role
- Display multiple group badges instead of single group
- Update filters to support "has any of these roles/groups"

**Edit Dialog:**
- Change role dropdown to multi-select
- Change group dropdown to multi-select
- Update validation logic

**Email Filtering:**
- "Send to members with role X" → "Send to members with ANY of roles X, Y, Z"
- "Send to members in group A" → "Send to members in ANY of groups A, B, C"

### 5. Update Seed Data

```typescript
// packages/database/prisma/seed.ts
const member = await prisma.member.create({
  data: {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    roles: {
      create: [
        { roleId: delegateTitulaireRole.id },
        { roleId: membreRole.id },
      ],
    },
    groups: {
      create: [
        { groupId: class6e1.id },
        { groupId: class5e2.id },
      ],
    },
  },
});
```

## Breaking Changes

### CSV Import
- Old CSV files with single role/group will still work
- New CSV format supports comma-separated roles/groups

### API Responses
- `member.role` → `member.roles[]`
- `member.group` → `member.groups[]`

### Filtering
- Filter logic changes from exact match to "contains any"
- Email campaigns will reach members with ANY matching role/group

## Rollback Plan

If issues arise:

```bash
# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD.sql

# Revert Prisma schema
git checkout packages/database/prisma/schema.prisma
npx prisma generate
```

## Testing Checklist

- [ ] Member import with single role/group
- [ ] Member import with multiple roles/groups
- [ ] Member edit with role/group changes
- [ ] Email filtering by roles
- [ ] Email filtering by groups
- [ ] Member list display
- [ ] CSV export format

## Timeline Estimate

- Schema migration: 30 minutes
- Code updates: 2-3 hours
- Testing: 1-2 hours
- **Total: 4-6 hours**

## Design Decisions ✅

### Confirmed Decisions

1. **UI/UX - Multiple Roles/Groups Display**: ⏳ To be decided
   - Option A: Show all badges (could be crowded)
   - Option B: Show count with tooltip
   - Option C: Show first + count

2. **CSV Import**: ⏳ To be decided
   - Support both single and multiple formats
   - Single: `role,groupe`
   - Multiple: `roles,groupes` (comma-separated)

3. **Email Filtering Logic**: ⏳ To be decided
   - AND vs OR logic for multiple roles/groups

4. **Primary Role/Group**: ⏳ To be decided
   - Consider for backward compatibility

5. **Hierarchical Groups - UI Display**: ✅ **INDENTED LIST**
   - Simple and effective
   - Padding based on depth level
   - Easy to implement and understand

6. **Hierarchical Groups - Selection**: ✅ **ALLOW PARENT SELECTION + AUTO-INCLUDE OPTION**
   - Users can select parent groups
   - Checkbox option: "Include child groups"
   - Flexible for different use cases

7. **Hierarchical Groups - Email Filtering**: ✅ **INCLUDE ALL CHILDREN**
   - Filter by "6ème" → Includes "6ème 1", "6ème 2", "6ème 3"
   - More intuitive for users
   - Can be refined later if needed

8. **Hierarchy Depth Limit**: ✅ **3 LEVELS MAXIMUM**
   - Level 1: Category (e.g., "6ème", "Football")
   - Level 2: Sub-category (e.g., "6ème 1", "U12")
   - Level 3: Specific group (e.g., "Équipe A")
   - Configurable later if needed
   - Covers 95% of use cases

9. **Circular Reference Prevention**: ✅ **VALIDATE ON SAVE**
   - Prevent A → B → A scenarios
   - Validate when creating/updating groups
   - Clear error messages

## Implementation Details

### Hierarchy Validation Functions

**1. Depth Validation:**
```typescript
const MAX_GROUP_DEPTH = 3;

async function validateGroupDepth(parentId: string | null): Promise<number> {
  if (!parentId) return 0;

  let depth = 1;
  let currentId: string | null = parentId;
  const visited = new Set<string>();

  while (currentId && depth < MAX_GROUP_DEPTH) {
    if (visited.has(currentId)) {
      throw new Error('Circular reference detected in group hierarchy');
    }
    visited.add(currentId);

    const parent = await prisma.groupType.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    if (!parent) {
      throw new Error(`Parent group with ID ${currentId} not found`);
    }

    if (!parent.parentId) break;
    currentId = parent.parentId;
    depth++;
  }

  if (depth >= MAX_GROUP_DEPTH) {
    throw new Error(
      `Maximum hierarchy depth of ${MAX_GROUP_DEPTH} levels reached`
    );
  }

  return depth;
}
```

**2. Circular Reference Prevention:**
```typescript
async function validateNoCircularReference(
  groupId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) return true;
  if (groupId === newParentId) return false; // Can't be own parent

  let currentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) return false; // Loop detected
    if (currentId === groupId) return false; // Parent is descendant

    visited.add(currentId);

    const parent = await prisma.groupType.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    if (!parent) break;
    currentId = parent.parentId;
  }

  return true;
}
```

**3. Get All Descendants (for filtering):**
```typescript
async function getAllDescendantIds(groupId: string): Promise<string[]> {
  const descendants: string[] = [groupId];
  
  const children = await prisma.groupType.findMany({
    where: { parentId: groupId },
    select: { id: true },
  });

  for (const child of children) {
    const childDescendants = await getAllDescendantIds(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}
```

### UI Components Needed

**1. Indented Group Display:**
```typescript
function GroupListItem({ group, depth }: { group: GroupType, depth: number }) {
  return (
    <div style={{ paddingLeft: `${depth * 24}px` }}>
      <Badge>{group.name}</Badge>
    </div>
  );
}
```

**2. Group Filter with "Include Children" Option:**
```typescript
<div>
  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
    {/* Render groups with indentation */}
  </Select>
  <Checkbox 
    checked={includeChildGroups}
    onCheckedChange={setIncludeChildGroups}
  >
    Include child groups
  </Checkbox>
</div>
```

## Recommendation

**Implement in phases:**

1. **Phase 1**: Schema migration + data preservation (4-6 hours)
   - Create junction tables
   - Add parentId to GroupType
   - Migrate existing data
   - Generate Prisma client

2. **Phase 2**: Update APIs to support many-to-many (6-8 hours)
   - Member CRUD with multiple roles/groups
   - Hierarchy validation functions
   - Filter logic with descendants

3. **Phase 3**: Update UI components (6-8 hours)
   - Multi-select dropdowns
   - Indented group display
   - "Include children" checkbox
   - Multiple badges display

4. **Phase 4**: Update CSV import/export (2-4 hours)
   - Support comma-separated roles/groups
   - Backward compatibility

5. **Phase 5**: Testing and refinement (4-6 hours)
   - Test hierarchy validation
   - Test circular reference prevention
   - Test filtering with descendants
   - Edge case testing

**Estimated total time**: 2-4 days of focused work
