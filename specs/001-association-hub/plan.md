# Implementation Plan: AssociationHub MVP

**Branch**: `001-association-hub` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-association-hub/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

AssociationHub is a member management and email communication platform for associations. MVP delivers:
- Single-tenant self-hosted version (open-source, MIT license)
- NextAuth authentication with template selection on first login
- Member CRUD with CSV import/export
- Email composition with template tags ({Nom}, {Role}, {Group})
- Single PDF attachment support
- Synchronous SMTP email sending
- Simple email history tracking

**Technical Approach**: pnpm monorepo with Next.js frontend, Prisma ORM, shadcn/ui components, deployed on Vercel (self-hostable anywhere)

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Node.js 20.x (LTS)
**Primary Dependencies**: 
  - Next.js 14+ (App Router)
  - Prisma 5.x (ORM)
  - NextAuth.js 5.x (authentication)
  - Nodemailer (SMTP email sending)
  - Zod (validation)
  - shadcn/ui + Tailwind CSS (UI)
  - Storybook 7.x (component library)
  - next-intl or react-i18next (i18n, French/English ready)
**Storage**: Vercel Postgres (PostgreSQL), Vercel Blob (file attachments)
**Testing**: Vitest (unit), Playwright (E2E), Storybook (component testing)
**Target Platform**: Web (Vercel deployment), mobile-first responsive UI
**Project Type**: Monorepo (Next.js app + Storybook component library + Prisma)
**Performance Goals**: 
  - CSV import: 200 members in < 10 minutes
  - Email send: < 5 minutes for filtered group
  - Page load: < 2s on 3G connection
**Constraints**: 
  - Single-tenant deployment (one association per instance)
  - Synchronous email sending (< 50 recipients per send)
  - Single PDF attachment (< 5MB)
  - French UI only for MVP (i18n-ready architecture)
**Scale/Scope**: 
  - < 500 members per association
  - 3 predefined templates (parents, sports, cultural)
  - 25 functional requirements
  - 4-month solo dev timeline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Package-First Architecture ✅
- **Status**: PASS
- **Evidence**: Monorepo structure with clear package boundaries:
  - `apps/web` (Next.js application)
  - `packages/ui` (shadcn/ui components + Storybook)
  - `packages/database` (Prisma schema + client)
  - `packages/email` (Nodemailer + template logic)
  - `packages/auth` (NextAuth configuration)
  - `packages/types` (shared TypeScript types)

### II. Type Safety First ✅
- **Status**: PASS
- **Evidence**:
  - TypeScript strict mode enforced
  - Prisma schema as single source of truth
  - Zod schemas for CSV validation and API boundaries
  - next-intl for type-safe i18n
  - No `any` types (enforced by ESLint)

### III. Database-First Design ✅
- **Status**: PASS
- **Evidence**:
  - Prisma schema defines all entities (User, Member, EmailCampaign, Role, GroupType)
  - Migrations required for all schema changes
  - Seed data for 3 templates (parents, sports, cultural)
  - Transactions for CSV import (atomicity)
  - Hard delete for MVP (soft delete deferred to post-MVP)

### IV. Component-Driven UI ✅
- **Status**: PASS
- **Evidence**:
  - shadcn/ui + Tailwind for component library
  - Storybook for component documentation
  - Server Components by default (Next.js App Router)
  - Client components marked with 'use client'
  - Mobile-first responsive design (exceptional UX requirement)

### V. API & Authentication Standards ✅
- **Status**: PASS
- **Evidence**:
  - NextAuth.js 5.x for authentication
  - Next.js API routes for backend logic
  - Row-level security not needed (single-tenant MVP)
  - Rate limiting deferred to post-MVP (SaaS version)
  - No API versioning needed (MVP, no breaking changes expected)

**Overall Status**: ✅ ALL GATES PASS - Ready for Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
association-hub/
├── apps/
│   └── web/                      # Next.js 14 application (App Router)
│       ├── app/                  # Next.js app directory
│       │   ├── (auth)/          # Auth route group
│       │   │   ├── login/
│       │   │   └── template-selection/
│       │   ├── (dashboard)/     # Dashboard route group
│       │   │   ├── members/
│       │   │   ├── emails/
│       │   │   └── settings/
│       │   ├── api/             # API routes
│       │   │   ├── auth/
│       │   │   ├── members/
│       │   │   ├── emails/
│       │   │   └── upload/
│       │   └── layout.tsx
│       ├── public/              # Static assets
│       ├── tests/               # E2E tests (Playwright)
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   └── components/     # shadcn/ui components
│   │   │       ├── Button/
│   │   │       ├── Input/
│   │   │       ├── Table/
│   │   │       └── ...
│   │   ├── .storybook/         # Storybook configuration
│   │   ├── stories/            # Component stories
│   │   └── package.json
│   │
│   ├── database/               # Prisma + database logic
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   ├── migrations/    # Migration files
│   │   │   └── seed.ts        # Seed data (3 templates)
│   │   ├── src/
│   │   │   ├── client.ts      # Prisma client export
│   │   │   ├── import.ts      # CSV import logic
│   │   │   └── queries/       # Reusable queries
│   │   ├── tests/             # Database tests
│   │   └── package.json
│   │
│   ├── email/                  # Email sending logic
│   │   ├── src/
│   │   │   ├── sender.ts      # Nodemailer wrapper
│   │   │   ├── templates.ts   # Template tag replacement
│   │   │   └── types.ts       # Email types
│   │   ├── tests/             # Email tests
│   │   └── package.json
│   │
│   ├── auth/                   # NextAuth configuration
│   │   ├── src/
│   │   │   ├── config.ts      # NextAuth config
│   │   │   └── providers.ts   # Auth providers
│   │   └── package.json
│   │
│   └── types/                  # Shared TypeScript types
│       ├── src/
│       │   ├── member.ts
│       │   ├── email.ts
│       │   └── template.ts
│       └── package.json
│
├── docs/                       # Documentation (bilingual EN/FR)
│   ├── en/                     # English docs (primary)
│   ├── fr/                     # French docs (secondary)
│   ├── dev/                    # Developer docs (English only)
│   └── user/                   # User guides (EN/FR)
│
├── .github/
│   └── workflows/              # CI/CD workflows
│
├── package.json                # Root package.json (pnpm workspace)
├── pnpm-workspace.yaml         # pnpm workspace config
├── turbo.json                  # Turborepo config (optional)
├── tsconfig.json               # Root TypeScript config
├── .env.example                # Environment variables template
├── README.md                   # English README
├── README.fr.md                # French README
├── CONTRIBUTING.md             # English contributing guide
├── CONTRIBUTING.fr.md          # French contributing guide
├── CODE_OF_CONDUCT.md          # English code of conduct
├── CODE_OF_CONDUCT.fr.md       # French code of conduct
└── LICENSE                     # MIT License
```

**Structure Decision**: pnpm monorepo with clear package boundaries. Each package is independently testable and reusable. Next.js app uses App Router with route groups for organization. Storybook lives in `packages/ui` for component documentation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - all constitution gates pass. No complexity tracking needed.
