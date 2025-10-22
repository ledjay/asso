# Research: AssociationHub Technical Decisions

**Date**: 2025-10-22  
**Feature**: AssociationHub MVP  
**Purpose**: Resolve technical unknowns and document architectural decisions

## Overview

This document captures research findings and technical decisions for the AssociationHub MVP. All technical unknowns have been resolved based on the specified tech stack (pnpm monorepo, Next.js, Prisma, shadcn/ui, Vercel).

## 1. Monorepo Tooling

### Decision: pnpm workspaces (with optional Turborepo later)

**Rationale**:
- **pnpm workspaces** is built into pnpm, zero additional dependencies
- Sufficient for MVP with 6 packages (web, ui, database, email, auth, types)
- Can add Turborepo later for caching and parallel builds if needed
- Simpler for solo dev - less configuration overhead
- Faster installs than npm/yarn (content-addressable storage)

**Alternatives Considered**:
- **Turborepo**: Better for large teams with many packages, adds build caching. Good post-MVP upgrade path.
- **npm workspaces**: Similar to pnpm, but pnpm is faster and more efficient
- **Yarn workspaces**: Similar to pnpm, no compelling advantage for this project

**Implementation**:
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "association-hub",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "test": "pnpm -r test",
    "storybook": "pnpm --filter ui storybook"
  }
}
```

---

## 2. ORM Choice: Prisma vs Drizzle

### Decision: Prisma 5.x

**Rationale**:
- **Prisma** has better TypeScript integration and type safety
- Excellent migration system (critical for database-first design)
- Built-in seeding support (needed for 3 templates)
- Better documentation and community support
- Prisma Studio for database inspection during development
- NextAuth.js has official Prisma adapter

**Alternatives Considered**:
- **Drizzle**: Lighter weight, but less mature ecosystem. Good for performance-critical apps, but Prisma sufficient for MVP.

**Implementation Pattern**:
```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  email         String          @unique
  password      String
  name          String
  createdAt     DateTime        @default(now())
  emailCampaigns EmailCampaign[]
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  sortOrder   Int
  members     Member[]
}

model GroupType {
  id       String   @id @default(cuid())
  name     String   @unique
  category String
  members  Member[]
}

model Member {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  roleId    String
  role      Role      @relation(fields: [roleId], references: [id])
  groupId   String
  group     GroupType @relation(fields: [groupId], references: [id])
  createdAt DateTime  @default(now())

  @@index([email])
  @@index([roleId])
  @@index([groupId])
}

model EmailCampaign {
  id             String   @id @default(cuid())
  subject        String
  bodyTemplate   String   @db.Text
  attachmentUrl  String?
  recipientCount Int
  sentAt         DateTime @default(now())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sentAt])
}
```

---

## 3. CSV Import Strategy

### Decision: Streaming parser with validation

**Rationale**:
- **papaparse** library handles CSV parsing with streaming support
- Zod schemas validate each row before database insert
- Prisma transaction wraps entire import for atomicity
- Progress tracking via row count for UX feedback

**Alternatives Considered**:
- **csv-parser**: Lower-level, more manual work
- **Direct file.text() + split**: Fragile, doesn't handle edge cases (quotes, newlines in fields)

**Implementation Pattern**:
```typescript
// packages/database/src/import.ts
import Papa from 'papaparse';
import { z } from 'zod';
import { prisma } from './client';

const MemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  group: z.string()
});

export async function importMembers(file: File) {
  const results = { success: 0, failed: 0, errors: [] };
  
  // Validate roles and groups exist in database
  const roles = await prisma.role.findMany();
  const groups = await prisma.groupType.findMany();
  
  return prisma.$transaction(async (tx) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step: async (row) => {
        const parsed = MemberSchema.safeParse(row.data);
        if (parsed.success) {
          const role = roles.find(r => r.name === parsed.data.role);
          const group = groups.find(g => g.name === parsed.data.group);
          
          if (role && group) {
            await tx.member.create({
              data: {
                name: parsed.data.name,
                email: parsed.data.email,
                roleId: role.id,
                groupId: group.id
              }
            });
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ row: row.meta.cursor, error: 'Invalid role or group' });
          }
        } else {
          results.failed++;
          results.errors.push({ row: row.meta.cursor, error: parsed.error });
        }
      }
    });
    return results;
  });
}
```

---

## 4. Email Sending Architecture

### Decision: Nodemailer with synchronous sending for MVP

**Rationale**:
- **Nodemailer** is battle-tested, supports all SMTP providers
- Synchronous sending acceptable for MVP (< 50 recipients per spec)
- Template tag replacement via simple string interpolation
- SMTP config from environment variables (no DB encryption for MVP)

**Alternatives Considered**:
- **Resend/SendGrid**: Requires API keys, not BYO SMTP
- **Bull queue + worker**: Overkill for MVP, adds Redis dependency
- **Vercel Edge Functions**: Can't use Nodemailer (no Node.js APIs)

**Implementation Pattern**:
```typescript
// packages/email/src/sender.ts
import nodemailer from 'nodemailer';

export async function sendEmail(params: {
  to: string[];
  subject: string;
  body: string;
  attachment?: { filename: string; url: string };
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Send emails sequentially (simple for MVP)
  for (const recipient of params.to) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: params.subject,
      html: params.body,
      attachments: params.attachment ? [{
        filename: params.attachment.filename,
        path: params.attachment.url
      }] : []
    });
  }
}
```

**Post-MVP Upgrade Path**: Add Bull queue for async sending, per-recipient tracking

---

## 5. File Upload & Storage

### Decision: Vercel Blob Storage

**Rationale**:
- **Vercel Blob** integrates seamlessly with Vercel deployment
- Simple API: `put(filename, file)` returns URL
- Automatic CDN distribution
- 5MB limit enforced client-side before upload
- Can be swapped for S3 or local storage for self-hosted deployments

**Alternatives Considered**:
- **AWS S3**: More complex setup, requires AWS account
- **Cloudflare R2**: Good but adds another service
- **Local filesystem**: Doesn't work on Vercel (ephemeral filesystem)

**Implementation Pattern**:
```typescript
// apps/web/app/api/upload/route.ts
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file') as File;
  
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
```

---

## 6. Authentication Strategy

### Decision: NextAuth.js v5 with Credentials Provider

**Rationale**:
- **NextAuth.js v5** (Auth.js) is the standard for Next.js
- Credentials provider for email/password (MVP requirement)
- Built-in session management, CSRF protection
- Easy to add OAuth providers post-MVP
- Official Prisma adapter

**Alternatives Considered**:
- **Clerk**: Paid service, not needed for MVP
- **Custom JWT**: Reinventing the wheel, security risks
- **Supabase Auth**: Requires Supabase, we're using Vercel Postgres

**Implementation Pattern**:
```typescript
// packages/auth/src/config.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@repo/database';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }
        
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  }
});
```

---

## 7. Component Library Setup

### Decision: shadcn/ui + Storybook in packages/ui

**Rationale**:
- **shadcn/ui** provides copy-paste components (not npm package)
- Components live in `packages/ui/src/components/`
- Storybook documents and tests components in isolation
- Tailwind CSS for styling (mobile-first)
- Follows constitution's component-driven UI principle

**Alternatives Considered**:
- **Radix UI directly**: shadcn/ui is built on Radix, provides better DX
- **Material UI**: Too opinionated, larger bundle size
- **Chakra UI**: Good but shadcn/ui better for customization

**Implementation Pattern**:
```typescript
// packages/ui/src/components/Button/Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
```

```typescript
// packages/ui/src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button'
  }
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
};
```

---

## 8. i18n Implementation

### Decision: next-intl for type-safe i18n

**Rationale**:
- **next-intl** is built specifically for Next.js App Router
- Type-safe translation keys (autocomplete in IDE)
- Server Component support out of the box
- Locale-aware formatting (dates, numbers, currency)
- French translations active, English prepared but hidden for MVP

**Alternatives Considered**:
- **react-i18next**: More general-purpose, but next-intl better for Next.js
- **next-translate**: Good but next-intl has better TypeScript support

**Implementation Pattern**:
```typescript
// apps/web/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'fr'; // Hardcoded for MVP, will be dynamic post-MVP
  
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
```

```json
// apps/web/locales/fr.json
{
  "common": {
    "send_email": "Envoyer l'email",
    "cancel": "Annuler",
    "save": "Enregistrer"
  },
  "members": {
    "import_success": "Parfait! Vos membres sont importés",
    "import_progress": "Import en cours... {count}/{total} membres"
  }
}
```

```typescript
// apps/web/app/members/page.tsx
import { useTranslations } from 'next-intl';

export default function MembersPage() {
  const t = useTranslations('members');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('import_progress', { count: 45, total: 200 })}</p>
    </div>
  );
}
```

---

## 9. Testing Strategy

### Decision: Vitest + Playwright + Storybook

**Rationale**:
- **Vitest**: Fast, Vite-native, compatible with Jest API
- **Playwright**: E2E testing for critical flows (login, import, send email)
- **Storybook**: Visual testing and component documentation
- **Testing Library**: For React component testing

**Test Coverage Priorities** (MVP):
1. **Unit tests**: Email template tag replacement, CSV validation
2. **Integration tests**: Database operations, email sending
3. **E2E tests**: Login → Import CSV → Send email flow
4. **Component tests**: Storybook interaction tests

**Implementation Pattern**:
```typescript
// packages/email/tests/templates.test.ts
import { describe, it, expect } from 'vitest';
import { replaceTemplateTags } from '../src/templates';

describe('replaceTemplateTags', () => {
  it('replaces all template tags', () => {
    const template = 'Bonjour {Nom}, vous êtes {Role} de la {Group}';
    const data = { Nom: 'Jean Dupont', Role: 'délégué titulaire', Group: 'CM2' };
    
    const result = replaceTemplateTags(template, data);
    
    expect(result).toBe('Bonjour Jean Dupont, vous êtes délégué titulaire de la CM2');
  });
});
```

```typescript
// apps/web/tests/e2e/email-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete email sending flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to email composer
  await page.click('text=Envoyer un email');

  // Fill email form
  await page.fill('[name="subject"]', 'Test Email');
  await page.fill('[name="body"]', 'Bonjour {Nom}');
  await page.selectOption('[name="role"]', 'delegue_titulaire');

  // Send
  await page.click('button:has-text("Envoyer")');

  // Verify success
  await expect(page.locator('text=Email envoyé avec succès')).toBeVisible();
});
```

---

## 10. Environment Variables

### Decision: Documented .env.example with Zod validation

**Required Environment Variables**:
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Association <noreply@example.com>"

# Vercel Blob (auto-populated on Vercel)
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
```

**Validation** (using Zod):
```typescript
// apps/web/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().regex(/^\d+$/),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  BLOB_READ_WRITE_TOKEN: z.string()
});

export const env = envSchema.parse(process.env);
```

---

## 11. Deployment Configuration

### Decision: Vercel with automatic deployments

**Rationale**:
- **Vercel** is optimized for Next.js (same company)
- Automatic preview deployments for PRs
- Vercel Postgres and Blob integrated
- Zero-config for pnpm monorepo (detects workspaces)
- Can be self-hosted on Railway, Docker, or VPS

**Build Configuration**:
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

**Database Migrations**:
- Run migrations in build step: `prisma migrate deploy`
- Seed data in development only: `prisma db seed`

---

## Summary

All technical decisions documented and ready for Phase 1 (Design & Contracts). Key takeaways:

✅ **Monorepo**: pnpm workspaces (simple, sufficient for MVP)  
✅ **ORM**: Prisma 5.x (better TypeScript, migrations, seeding)  
✅ **CSV Import**: papaparse + Zod + Prisma transactions  
✅ **Email**: Nodemailer synchronous (upgrade to queue post-MVP)  
✅ **Storage**: Vercel Blob (5MB limit, swappable for self-hosted)  
✅ **Auth**: NextAuth.js v5 with credentials  
✅ **UI**: shadcn/ui + Storybook + Tailwind  
✅ **i18n**: next-intl (type-safe, French active, English prepared)  
✅ **Testing**: Vitest + Playwright + Storybook  
✅ **Deployment**: Vercel with auto-deployments (self-hostable)

**Next Phase**: Generate data-model.md and API contracts
