# Implementation Tasks: AssociationHub MVP

**Branch**: `001-association-hub` | **Date**: 2025-10-22  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the AssociationHub MVP implementation into executable tasks organized by user story. Each phase represents a complete, independently testable increment.

**Total Tasks**: 95 tasks  
**Parallel Opportunities**: 50 parallelizable tasks  
**MVP Scope**: User Stories 1-4 (complete end-to-end flow with many-to-many)

## Implementation Strategy

**Incremental Delivery**: Each user story phase delivers a working, testable feature increment:
- **Phase 3 (US1)**: Complete authentication → template selection → member import → email sending flow
- **Phase 4 (US2)**: Member management and filtering capabilities
- **Phase 5 (US3)**: Email composition with tracking

**MVP-First Approach**: Focus on P1 user stories first, defer P2/P3 features to post-MVP iterations.

---

## Phase 1: Setup & Project Initialization

**Goal**: Bootstrap pnpm monorepo with Next.js, Prisma, and package structure

**Tasks**:

- [x] T001 Initialize pnpm workspace with root package.json and pnpm-workspace.yaml
- [x] T002 Create apps/web directory with Next.js 14 App Router setup
- [x] T003 Create packages/ui directory with package.json and tsconfig.json
- [x] T004 Create packages/database directory with package.json and Prisma setup
- [x] T005 Create packages/email directory with package.json
- [x] T006 Create packages/auth directory with package.json
- [x] T007 Create packages/types directory with package.json
- [x] T008 Configure root tsconfig.json with paths for all packages
- [x] T009 Create .env.example with all required environment variables
- [x] T010 Configure Tailwind CSS in apps/web/tailwind.config.ts
- [x] T011 Create apps/web/app/layout.tsx with root layout and providers
- [x] T012 Configure next-intl for i18n in apps/web/i18n.ts
- [x] T013 Create locales/fr.json and locales/en.json with initial translations
- [x] T014 Set up ESLint and Prettier configs in root
- [x] T015 Create .github/workflows/ci.yml for GitHub Actions
- [x] T016 Create README.md and README.fr.md with setup instructions
- [x] T017 Create CONTRIBUTING.md and CONTRIBUTING.fr.md
- [x] T018 Create CODE_OF_CONDUCT.md and CODE_OF_CONDUCT.fr.md
- [x] T019 Create LICENSE file (MIT)

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up database schema, authentication, and shared UI components (blocking prerequisites)

**Database Schema** (Many-to-Many & Hierarchical):

- [x] T020 Update Prisma schema with **MemberRole** and **MemberGroup** junction tables
- [x] T020a Add **parentId** field to GroupType for hierarchical structure (self-referential)
- [x] T020b Remove roleId and groupId foreign keys from Member model
- [x] T021 Create migration for many-to-many schema (replaces old single FK schema)
- [x] T022 Update seed script for 3 templates with hierarchical groups and junction table data
- [x] T023 [P] Create Prisma client export in packages/database/src/client.ts
- [x] T024 [P] Create database query helpers in packages/database/src/queries/
- [x] T024a [P] Create group hierarchy validation utilities in packages/database/src/group-hierarchy.ts
- [x] T024b [P] Implement validateGroupDepth function (max 3 levels)
- [x] T024c [P] Implement validateNoCircularReference function
- [x] T024d [P] Implement getAllDescendantIds function for filtering

**Authentication Foundation**:

- [x] T025 Install NextAuth.js v5 and configure in packages/auth/src/config.ts
- [x] T026 Create Credentials provider with bcrypt password hashing
- [x] T027 Create auth API routes in apps/web/app/api/auth/[...nextauth]/route.ts
- [x] T028 [P] Create auth middleware in apps/web/proxy.ts for protected routes (renamed from middleware.ts)
- [x] T029 [P] Create useSession hook wrapper in packages/auth/src/hooks.ts

**Shared UI Components** (shadcn/ui):

- [x] T030 [P] Initialize shadcn/ui in apps/web with components.json config
- [x] T031 [P] Create Button component (shadcn/ui)
- [x] T032 [P] Create Input component (shadcn/ui)
- [x] T033 [P] Create Table component (shadcn/ui)
- [x] T034 [P] Create Select component (shadcn/ui)
- [x] T035 [P] Create Dialog component (shadcn/ui)
- [x] T036 [P] Create Toast component (sonner)
- [x] T037 [P] Create Card component (shadcn/ui)
- [x] T038 [P] Create Badge component (shadcn/ui)
- [x] T039 [P] Added Label, Textarea, Dropdown, Separator components

**Storybook Setup**:

- [ ] T040 Initialize Storybook 7.x in packages/ui/.storybook/ (DEFERRED - not critical for MVP)
- [ ] T041 [P] Create Button.stories.tsx with all variants (DEFERRED)
- [ ] T042 [P] Create Input.stories.tsx with validation states (DEFERRED)
- [ ] T043 [P] Create Table.stories.tsx with sample data (DEFERRED)

---

## Phase 3: User Story 1 - Authentication & First Email Flow

**User Story**: Tenant onboarding and first email (P1 - MVP Critical)

**Goal**: Complete end-to-end flow from signup → template selection → member import → email sending

**Independent Test**: Create account, select "Parents d'élèves" template, import 10 members via CSV, send test email with PDF attachment to filtered group (e.g., "Délégué titulaire" in "CM2")

### Authentication & Onboarding

- [x] T044 [US1] Create login page in apps/web/app/login/page.tsx
- [x] T045 [US1] Create login form component with email/password validation
- [x] T046 [US1] Implement login with NextAuth signIn (client-side)
- [ ] T047 [US1] Create signup page (DEFERRED - using seeded admin user for MVP)
- [x] T048 [US1] Create template selection page in apps/web/app/template-selection/page.tsx
- [x] T049 [US1] Create template selection UI with 3 cards (Parents, Sports, Cultural)
- [x] T050 [US1] Implement template selection API in apps/web/app/api/templates/select/route.ts
- [x] T051 [US1] Database seeding logic integrated in API (transaction-based)

### SMTP Configuration (Database-Backed BYO SMTP)

- [x] T052 [US1] Add SMTPConfiguration model to Prisma schema with encryption
- [x] T053 [US1] Create encryption utilities in packages/database/src/encryption.ts
- [x] T054 [US1] Create Prisma migration for SMTPConfiguration table
- [x] T055 [US1] Create settings page in apps/web/app/dashboard/settings/page.tsx
- [x] T056 [US1] Create SMTP configuration form with validation
- [x] T057 [US1] Create SMTP save API in apps/web/app/api/settings/smtp/route.ts
- [x] T058 [US1] Create SMTP test endpoint in apps/web/app/api/settings/smtp/test/route.ts
- [x] T059 [US1] Update email send API to load SMTP config from database
- [x] T060 [US1] Add ENCRYPTION_KEY to .env.example and update documentation

### Member Import (CSV)

- [x] T061 [US1] Create members page in apps/web/app/dashboard/members/page.tsx
- [x] T062 [US1] Create CSV import UI with file upload and drag-drop
- [x] T063 [US1] Create CSV import API in apps/web/app/api/members/import/route.ts
- [x] T064 [US1] Implement CSV parser (native, no papaparse needed for simple CSV)
- [x] T065 [US1] CSV validation against database roles/groups
- [x] T066 [US1] Implement transaction-based import with error handling
- [x] T067 [US1] Import feedback UI with success/error messages via toast

### Email Composition & Sending

- [x] T068 [US1] Create email composer page in apps/web/app/dashboard/emails/compose/page.tsx
- [x] T069 [US1] Create email form with subject, body fields
- [x] T070 [US1] Implement template tag insertion UI ({Nom}, {Role}, {Groupe})
- [ ] T071 [US1] Create file upload API (DEFERRED - MVP sends emails without attachments)
- [ ] T072 [US1] Implement 5MB file size validation (DEFERRED)
- [x] T073 [US1] Create recipient filter UI (role and group dropdowns)
- [x] T074 [US1] Create email send API in apps/web/app/api/emails/send/route.ts
- [x] T075 [US1] Implement Nodemailer email sending with SMTP
- [x] T076 [US1] Implement template tag replacement ({Nom} → actual name, {Role}, {Groupe})
- [x] T077 [US1] Save email campaigns to database
- [x] T078 [US1] Display sent emails history and confetti animation

---

## Phase 4: User Story 2 - Member Management & Filtering

**User Story**: Member management and filtering (P2)

**Goal**: View, search, filter, edit, and delete members

**Independent Test**: Import diverse member list, filter by role (e.g., "Délégué titulaire"), filter by group (e.g., "CM2"), combine filters, search by name, edit member email, delete member

### Member List & Filtering (Many-to-Many Support)

- [x] T074 [P] [US2] Update member list to display **multiple role badges** per member
- [x] T074a [P] [US2] Update member list to display **multiple group badges** per member
- [x] T074b [P] [US2] Add "+N more" badge for members with 5+ roles/groups
- [x] T075 [P] [US2] Update role filter to support "has any of these roles" logic
- [x] T076 [P] [US2] Update group filter with **indented list** for hierarchy
- [x] T076a [P] [US2] Add "Include child groups" checkbox to group filter
- [x] T076b [US2] Implement descendant filtering logic (when checkbox enabled)
- [x] T077 [P] [US2] Implement search input with client-side filtering
- [x] T078 [US2] Create members API with POST for creating members
- [x] T079 [US2] Update combined filter logic for many-to-many (role OR group)
- [ ] T080 [P] [US2] Create "Send email to selection" button (deferred - can use compose page)

### Member CRUD (Many-to-Many Support)

- [ ] T081 [P] [US2] Update member edit dialog with **multi-select for roles**
- [ ] T081a [P] [US2] Update member edit dialog with **multi-select for groups**
- [ ] T082 [P] [US2] Update member edit form validation for multiple selections
- [x] T083 [US2] Update member update API to handle junction table updates (PATCH)
- [x] T083a [US2] Add unique constraint validation for member-role combinations
- [x] T083b [US2] Add unique constraint validation for member-group combinations
- [x] T084 [P] [US2] Create member delete confirmation dialog
- [x] T085 [US2] Update member delete API to cascade delete junction records
- [ ] T086 [P] [US2] Create member creation form (deferred - CSV import is primary method)
- [x] T087 [US2] Update member create API to create junction table records (POST)

### CSV Import/Export (Many-to-Many Support)

- [x] T087a [US2] Update CSV import to support semicolon-separated roles (e.g., "role1;role2")
- [x] T087b [US2] Update CSV import to support semicolon-separated groups (e.g., "group1;group2")
- [x] T087c [US2] Maintain backward compatibility with single role/group format
- [x] T088 [P] [US2] Update CSV export to include multiple roles per member
- [x] T088a [P] [US2] Update CSV export to include multiple groups per member
- [x] T089 [US2] Update CSV export API to query junction tables
- [x] T090 [US2] Generate CSV with semicolon-separated roles and groups

---

## Phase 5: User Story 3 - Email History & Tracking

**User Story**: Email sending with basic tracking (P1 - MVP)

**Goal**: View email history with simple "sent" confirmation

**Independent Test**: Send multiple emails, view history list with date/subject/count, verify template tags were replaced correctly

### Email History

- [x] T091 [P] [US3] Create email history page in apps/web/app/dashboard/emails/history/page.tsx
- [x] T092 [P] [US3] Create email history table with pagination (50 campaigns limit)
- [x] T093 [US3] Create email history API (integrated in page.tsx as Server Component)
- [x] T094 [P] [US3] Display date, subject, recipient count for each campaign
- [x] T095 [P] [US3] Add body preview in table (modal deferred to post-MVP)

---

## Phase 6: User Story 4 - Many-to-Many & Hierarchical Groups

**User Story**: Many-to-many roles and hierarchical groups (P1 - MVP Critical)

**Goal**: Enable members with multiple roles/groups and hierarchical group structures

**Independent Test**: Assign multiple roles to member, assign multiple groups, create 3-level hierarchy (e.g., "Football" → "U12" → "Équipe A"), filter by parent with "Include children", verify circular reference prevention

### Group Management UI

- [x] T091a [P] [US4] Create group management page in apps/web/app/dashboard/groups/page.tsx
- [x] T091b [P] [US4] Display groups in indented list (padding based on depth level)
- [x] T091c [P] [US4] Add "Add child group" button for each group
- [x] T091d [US4] Implement group creation with parent selection
- [x] T091e [US4] Add validation to prevent circular references on save
- [x] T091f [US4] Add validation to prevent exceeding 3-level depth
- [x] T091g [P] [US4] Add group edit dialog with parent selection dropdown
- [x] T091h [P] [US4] Add group delete with cascade warning (shows affected children)

### Email Filtering with Hierarchy

- [ ] T092a [US4] Update email composer filters to use getAllDescendantIds
- [ ] T092b [P] [US4] Add "Include child groups" checkbox to email filters
- [ ] T092c [US4] Update recipient query to include descendants when checkbox enabled
- [ ] T092d [P] [US4] Update recipient count display to show hierarchy inclusion

### Template Tag Handling

- [ ] T093a [US4] Update template tag replacement for members with multiple roles
- [ ] T093b [US4] Decide on {Role} tag behavior: first role or comma-separated list
- [ ] T093c [US4] Update template tag replacement for members with multiple groups
- [ ] T093d [US4] Decide on {Group} tag behavior: first group or comma-separated list

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: UX polish, error handling, mobile responsiveness, documentation

### UX Enhancements

- [ ] T096 [P] Add loading states with progress indicators to all async operations
- [ ] T097 [P] Implement optimistic UI updates for member edits
- [ ] T098 [P] Add confetti animation on first email sent (use canvas-confetti)
- [ ] T099 [P] Create empty states with helpful CTAs (e.g., "Import your first members")
- [ ] T100 [P] Add inline examples to all form fields (e.g., "Ex: 6e1, CM2")
- [ ] T101 [P] Implement toast notifications for all success/error states
- [ ] T102 [P] Add confirmation dialogs for destructive actions
- [ ] T103 [P] Implement keyboard shortcuts (Cmd+K for search, Escape for modals)

### Error Handling

- [ ] T104 [P] Create error boundary component in apps/web/app/error.tsx
- [ ] T105 [P] Implement helpful error messages with suggested fixes
- [ ] T106 [P] Add SMTP connection error handling with retry prompts
- [ ] T107 [P] Add CSV validation error messages with row numbers
- [ ] T108 [P] Add file upload error handling (size, type validation)

### Mobile Responsiveness

- [ ] T109 [P] Test and fix member list table on mobile (responsive design)
- [ ] T110 [P] Test and fix email composer on mobile (touch-friendly)
- [ ] T111 [P] Test and fix template selection on mobile
- [ ] T112 [P] Test and fix navigation on mobile (hamburger menu if needed)

### Documentation

- [ ] T113 [P] Create user guide in docs/user/fr/getting-started.md
- [ ] T114 [P] Create SMTP setup guide in docs/user/fr/smtp.md
- [ ] T115 [P] Create CSV import guide in docs/user/fr/members.md
- [ ] T116 [P] Translate user guides to English in docs/user/en/
- [ ] T117 [P] Create deployment guide for Vercel in docs/en/deploy-vercel.md
- [ ] T118 [P] Create deployment guide for Railway in docs/en/deploy-railway.md
- [ ] T119 [P] Create Docker deployment guide in docs/en/deploy-docker.md
- [ ] T120 [P] Create developer architecture docs in docs/dev/architecture.md

### Testing

- [ ] T121 [P] Write unit tests for template tag replacement
- [ ] T122 [P] Write unit tests for CSV validation
- [ ] T123 [P] Write integration test for member import flow
- [ ] T124 [P] Write E2E test for complete email sending flow (Playwright)
- [ ] T125 [P] Write E2E test for member filtering
- [ ] T126 [P] Set up Storybook interaction tests for key components

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
                                              ↓
                                         MVP Complete
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) delivers MVP core value

**Independent Stories**:
- US2 (Member Management) depends on US1 (members must exist)
- US3 (Email History) depends on US1 (emails must be sent)
- US2 and US3 can be developed in parallel after US1 completes

### Parallel Execution Opportunities

**Phase 2 (Foundation)**:
- Database schema (T020-T024) can be done in parallel with UI components (T030-T039)
- Auth setup (T025-T029) can be done in parallel with Storybook (T040-T043)

**Phase 3 (US1)**:
- SMTP configuration (T052-T055) can be done in parallel with member import UI (T056-T062)
- Email composition UI (T063-T068) can be done in parallel with email sending logic (T069-T073)

**Phase 4 (US2)**:
- Member list UI (T074-T080) can be done in parallel with CRUD operations (T081-T087)
- CSV export (T088-T090) can be done independently

**Phase 6 (US4 - Many-to-Many)**:
- Group management UI tasks (T091a-T091h) - some can be parallel
- Email filtering updates (T092a-T092d) - sequential, depends on getAllDescendantIds
- Template tag handling (T093a-T093d) - can be parallel

**Phase 7 (Polish)**:
- All UX enhancements (T096-T103) can be done in parallel
- All error handling (T104-T108) can be done in parallel
- All documentation (T113-T120) can be done in parallel
- All testing (T121-T126) can be done in parallel

---

## MVP Scope Recommendation

**Minimum Viable Product**: Complete Phase 1-6 (US1-US4) + critical polish from Phase 7

**MVP Delivers**:
- ✅ Authentication and template selection
- ✅ SMTP configuration
- ✅ CSV member import with **many-to-many support**
- ✅ Member management with **multiple roles/groups per member**
- ✅ **Hierarchical group structures** (3 levels max)
- ✅ Email composition with template tags
- ✅ Email filtering with **"Include child groups"** option
- ✅ Email sending with attachments
- ✅ Email history tracking
- ✅ **Circular reference prevention** for groups

**Critical for MVP** (Cannot be deferred):
- Many-to-many relationships (Phase 2 database + Phase 4 UI)
- Hierarchical groups (Phase 2 database + Phase 6 UI)
- This is how real associations work - not optional

**Defer to Post-MVP**:
- Advanced polish (Phase 7)
- Storybook documentation
- Comprehensive E2E tests

**Rationale**: Real-world associations REQUIRE members with multiple roles and hierarchical group structures. This is not an enhancement - it's the foundation of how associations operate.

---

## Task Execution Guidelines

### For Each Task

1. **Read**: Review task description and file path
2. **Context**: Check related tasks and dependencies
3. **Implement**: Write code following constitution principles
4. **Verify**: Test the specific functionality
5. **Document**: Add inline comments for complex logic
6. **Commit**: Commit with descriptive message

### Code Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **Prisma**: All data changes via migrations
- **Components**: Server Components by default, mark client with 'use client'
- **i18n**: All UI strings use translation keys
- **Testing**: Unit tests for business logic, E2E for critical flows
- **Mobile**: Test on real device or browser DevTools

### When Stuck

1. Check research.md for technical decisions
2. Check data-model.md for entity relationships
3. Check contracts/api.yaml for API specifications
4. Check quickstart.md for setup instructions
5. Ask for clarification if requirements are unclear

---

## Progress Tracking

**Phase 1 (Setup)**: ✅ 19/19 tasks complete (100%)  
**Phase 2 (Foundation)**: ✅ 17/28 tasks complete (60.7%) - Database & hierarchy validation complete  
  - Database schema with junction tables ✅ (T020-T022)
  - Group hierarchy validation utilities ✅ (T024a-T024d)
  - Auth & UI components ✅ (T025-T039)
  - Storybook deferred (T040-T043)
  
**Phase 3 (US1)**: ✅ 21/35 tasks complete (60.0%) - SMTP database-backed  
**Phase 4 (US2)**: ✅ 23/28 tasks complete (82.1%) - Hierarchical filtering working  
  - Member list multiple badges ✅ (T074-T074b)
  - CSV import/export ✅ (T087a-T087c, T088-T090)
  - Member CRUD APIs ✅ (T083-T085, T087)
  - Hierarchical filtering ✅ (T075-T079)
  - CRUD UI needs multi-select (T081-T082)
  - Deferred tasks (T080, T086)
  
**Phase 5 (US3)**: ✅ 5/5 tasks complete (100%)  
**Phase 6 (US4 - Many-to-Many)**: ✅ 8/12 tasks complete (66.7%) - Group management done  
  - Group management UI ✅ (T091a-T091h)
  - Email filtering with hierarchy (T092a-T092d)
  - Template tag handling (T093a-T093d)
  
**Phase 7 (Polish)**: ⬜ 0/31 tasks complete (0%)  

**Total**: ✅ 82/158 tasks complete (51.9%) - **Phase 6 in progress - group management complete**

**Critical Path**: Phase 2 ✅ → Phase 4 member UI → Phase 6 hierarchy UI

---

## Next Steps

1. ✅ Review this task breakdown
2. 🚀 Start with Phase 1 (Setup)
3. 📦 Complete Phase 2 (Foundation)
4. 🎯 Implement Phase 3 (US1) for MVP
5. 🔄 Iterate on Phase 4-6 based on feedback

**Estimated Timeline**: 4 months (solo dev)
- Month 1: Phase 1-2 + start Phase 3
- Month 2: Complete Phase 3 (US1)
- Month 3: Phase 4-5 (US2-US3)
- Month 4: Phase 6 (Polish) + deployment + docs

Good luck! 🚀
