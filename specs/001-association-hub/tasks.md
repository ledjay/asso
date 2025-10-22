# Implementation Tasks: AssociationHub MVP

**Branch**: `001-association-hub` | **Date**: 2025-10-22  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the AssociationHub MVP implementation into executable tasks organized by user story. Each phase represents a complete, independently testable increment.

**Total Tasks**: 87 tasks  
**Parallel Opportunities**: 45 parallelizable tasks  
**MVP Scope**: User Stories 1-3 (complete end-to-end flow)

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

**Database Schema**:

- [x] T020 Create Prisma schema in packages/database/prisma/schema.prisma with User, Role, GroupType, Member, EmailCampaign models
- [x] T021 Create initial migration with prisma migrate dev
- [x] T022 Create seed script in packages/database/prisma/seed.ts for 3 templates
- [x] T023 [P] Create Prisma client export in packages/database/src/client.ts
- [x] T024 [P] Create database query helpers in packages/database/src/queries/

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

### Member List & Filtering

- [ ] T074 [P] [US2] Create member list table component with pagination
- [ ] T075 [P] [US2] Implement role filter dropdown (populated from database)
- [ ] T076 [P] [US2] Implement group filter dropdown (populated from database)
- [ ] T077 [P] [US2] Implement search input with debounce
- [ ] T078 [US2] Create members API with filtering in apps/web/app/api/members/route.ts
- [ ] T079 [US2] Implement combined filter logic (role AND group)
- [ ] T080 [P] [US2] Create "Send email to selection" button with pre-populated recipients

### Member CRUD

- [ ] T081 [P] [US2] Create member detail modal/page
- [ ] T082 [P] [US2] Create member edit form with validation
- [ ] T083 [US2] Implement member update API in apps/web/app/api/members/[id]/route.ts
- [ ] T084 [P] [US2] Create member delete confirmation dialog
- [ ] T085 [US2] Implement member delete API (hard delete for MVP)
- [ ] T086 [P] [US2] Create member creation form
- [ ] T087 [US2] Implement member create API

### CSV Export

- [ ] T088 [P] [US2] Create CSV export button on member list
- [ ] T089 [US2] Implement CSV export API in apps/web/app/api/members/export/route.ts
- [ ] T090 [US2] Generate CSV with all member data

---

## Phase 5: User Story 3 - Email History & Tracking

**User Story**: Email sending with basic tracking (P1 - MVP)

**Goal**: View email history with simple "sent" confirmation

**Independent Test**: Send multiple emails, view history list with date/subject/count, verify template tags were replaced correctly

### Email History

- [ ] T091 [P] [US3] Create email history page in apps/web/app/(dashboard)/emails/history/page.tsx
- [ ] T092 [P] [US3] Create email history table with pagination
- [ ] T093 [US3] Create email history API in apps/web/app/api/emails/history/route.ts
- [ ] T094 [P] [US3] Display date, subject, recipient count for each campaign
- [ ] T095 [P] [US3] Add "View details" modal showing body template and attachment

---

## Phase 6: Polish & Cross-Cutting Concerns

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

**Phase 6 (Polish)**:
- All UX enhancements (T096-T103) can be done in parallel
- All error handling (T104-T108) can be done in parallel
- All documentation (T113-T120) can be done in parallel
- All testing (T121-T126) can be done in parallel

---

## MVP Scope Recommendation

**Minimum Viable Product**: Complete Phase 1-3 (US1) + critical polish from Phase 6

**MVP Delivers**:
- ✅ Authentication and template selection
- ✅ SMTP configuration
- ✅ CSV member import
- ✅ Email composition with template tags
- ✅ Email sending with attachments
- ✅ Basic success confirmation

**Defer to Post-MVP**:
- Member management UI (Phase 4)
- Email history (Phase 5)
- Advanced polish (Phase 6)

**Rationale**: US1 alone proves core value proposition (non-technical admin can send personalized emails). US2 and US3 enhance but aren't critical for initial validation.

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

**Phase 1**: ✅ 19/19 tasks complete (100%)  
**Phase 2**: ✅ 20/24 tasks complete (83.3%) - Database, Auth & UI components done, Storybook deferred  
**Phase 3 (US1)**: ✅ 21/35 tasks complete (60.0%) - SMTP now database-backed (5 new tasks added)  
**Phase 4 (US2)**: ⬜ 0/17 tasks complete  
**Phase 5 (US3)**: ⬜ 0/5 tasks complete  
**Phase 6**: ⬜ 0/31 tasks complete  

**Total**: ✅ 60/136 tasks complete (44.1%) - **SMTP configuration upgraded to database storage**

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
