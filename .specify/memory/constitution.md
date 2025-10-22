# SaaS Monorepo Constitution

## Core Principles

### I. Package-First Architecture
Every feature starts as a workspace package in the monorepo. Packages must be:
- Self-contained with clear boundaries
- Independently testable with their own test suite
- Documented with README and TypeScript types
- Reusable across apps (web, mobile, admin)
- No circular dependencies between packages

### II. Type Safety First
TypeScript strict mode enforced across all packages and apps:
- No `any` types without explicit justification
- Prisma schema as single source of truth for data models
- Shared types package for cross-package contracts
- Zod schemas for runtime validation at API boundaries
- Type-safe API routes using tRPC or similar

### III. Database-First Design (NON-NEGOTIABLE)
All data changes start with Prisma schema:
- Schema changes → Migration generated → Review → Apply
- No direct SQL without migration
- Seed data for development and testing
- Database transactions for multi-step operations
- Soft deletes for user data (GDPR compliance)

### IV. Component-Driven UI
UI components follow atomic design principles:
- Shared component library using shadcn/ui + Tailwind
- Components are server-first (React Server Components)
- Client components explicitly marked with 'use client'
- Storybook for component documentation and testing
- Responsive by default (mobile-first approach)

### V. API & Authentication Standards
- Next.js API routes or tRPC for type-safe APIs
- NextAuth.js for authentication (OAuth + credentials)
- Row-level security considerations in Prisma queries
- Rate limiting on public endpoints
- API versioning when breaking changes needed

## Performance & Optimization

- Server-side rendering (SSR) for SEO-critical pages
- Static generation (SSG) where possible
- Image optimization using next/image
- Code splitting and lazy loading for client bundles
- Database query optimization (indexes, N+1 prevention)
- Edge caching for static assets and API responses

## Development Workflow

- Feature branches from main
- PR requires: passing tests, type checks, linting
- Database migrations reviewed separately before merge
- Environment variables documented in .env.example
- Vercel preview deployments for every PR
- Staging environment mirrors production setup

## Governance

This constitution supersedes all other development practices:
- All PRs must comply with these principles
- Exceptions require explicit justification and team approval
- Breaking changes require migration guide
- New packages require architecture review
- Security vulnerabilities take priority over features

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
