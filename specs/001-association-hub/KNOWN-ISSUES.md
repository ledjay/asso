# Known Issues - Phase 2 to Phase 4 Transition

**Status**: Expected TypeScript errors during migration to many-to-many schema  
**Date**: October 22, 2025

## Overview

Phase 2 completed the database schema migration to many-to-many relationships, but the web app UI (Phase 4) has not been updated yet. This causes expected TypeScript errors.

## Expected Errors in `apps/web`

The following files have TypeScript errors because they reference the old schema:

### Member API Routes
- `app/api/members/[id]/route.ts` - Expects single `roleId`/`groupId` (now junction tables)
- `app/api/members/route.ts` - Creates members with single role/group
- `app/api/members/export/route.ts` - Exports single role/group per member

### Email API Routes
- `app/api/emails/send/route.ts` - Queries members with old schema

### Template Selection
- `app/api/templates/select/route.ts` - Seeds with old schema structure

### Member Pages
- `app/dashboard/members/page.tsx` - Displays single role/group badges

## Root Cause

**Old Schema (Phase 1-3)**:
```prisma
model Member {
  roleId  String  // Single role FK
  groupId String? // Single group FK
  role    Role    @relation(...)
  group   GroupType? @relation(...)
}
```

**New Schema (Phase 2+)**:
```prisma
model Member {
  roles  MemberRole[]  // Many-to-many
  groups MemberGroup[] // Many-to-many
}

model MemberRole {
  memberId String
  roleId   String
  @@unique([memberId, roleId])
}

model MemberGroup {
  memberId String
  groupId  String
  @@unique([memberId, groupId])
}
```

## Resolution Plan

These errors will be fixed in **Phase 4 (US2)** when we update:

1. **Member CRUD APIs** (T081-T087)
   - Update create/update to use junction tables
   - Support multiple roles/groups per member

2. **Member List UI** (T074-T080)
   - Display multiple role badges
   - Display multiple group badges
   - Update filters for many-to-many

3. **CSV Import/Export** (T087a-T090)
   - Support comma-separated roles/groups
   - Update export to query junction tables

4. **Email Filtering** (T092a-T092d)
   - Update recipient queries for many-to-many
   - Add hierarchical filtering

## Workaround for Development

If you need to run the app before Phase 4:

### Option 1: Skip typecheck (temporary)
```bash
# Run dev server without typecheck
cd apps/web
pnpm dev --no-typecheck
```

### Option 2: Comment out broken routes (temporary)
Temporarily disable the affected API routes until Phase 4.

### Option 3: Use Phase 1 schema (rollback)
```bash
# Rollback to single FK schema (NOT RECOMMENDED)
cd packages/database
git checkout <commit-before-phase-2>
pnpm prisma migrate dev
```

## Testing Strategy

For Phase 2 testing, focus on:
- ✅ Database package typecheck: `cd packages/database && pnpm typecheck`
- ✅ Seed script: `pnpm prisma:seed`
- ✅ Prisma Studio: `pnpm prisma:studio`
- ✅ Hierarchy validation utilities (unit tests)

Skip full monorepo typecheck until Phase 4 is complete.

## Timeline

- **Phase 2**: ✅ Complete (database schema)
- **Phase 4**: 🚧 In progress (UI updates needed)
- **Expected resolution**: When Phase 4 tasks T074-T090 are complete

## Notes

This is a **planned migration state**, not a bug. The database schema is correct and ready for Phase 4 implementation.

---

**Next Action**: Proceed with Phase 4 member management UI updates to resolve these errors.
