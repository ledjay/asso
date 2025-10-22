# @repo/database

Database layer for AssociationHub using Prisma ORM.

## Overview

This package contains:
- **Prisma schema** - Database models and relationships
- **Prisma client** - Type-safe database client
- **Seed scripts** - Template data for 3 association types
- **Query helpers** - Reusable database queries

## Usage

```typescript
import { prisma } from '@repo/database/client';

// Query members
const members = await prisma.member.findMany({
  include: {
    role: true,
    group: true,
  },
});
```

## Database Schema

### Entities

- **User** - Admin user (single-tenant MVP)
- **Role** - Dynamic roles (stored in DB, not enum)
- **GroupType** - Dynamic groups (classes, teams, sections)
- **Member** - Association members
- **EmailCampaign** - Email history

### Templates

Three predefined templates are available:

1. **Parents d'élèves** - Roles: Délégué titulaire, Délégué suppléant, Membre | Groups: Classes (6e1, 5e2, CM2, CE1)
2. **Sports Club** - Roles: Entraîneur, Joueur, Parent | Groups: Équipes (Poussins, Cadets, U12, Lundi 18h)
3. **Cultural Association** - Roles: Président, Membre actif, Membre | Groups: Sections (Débutant, Intermédiaire, Expert)

## Development

### Generate Prisma Client

```bash
pnpm prisma:generate
```

### Create Migration

```bash
pnpm prisma:migrate
```

### Seed Database

```bash
# Seed with Parents template (default)
pnpm prisma:seed

# Seed with Sports template
SEED_TEMPLATE=sports pnpm prisma:seed

# Seed with Cultural template
SEED_TEMPLATE=cultural pnpm prisma:seed
```

### Open Prisma Studio

```bash
pnpm prisma:studio
```

### Reset Database

```bash
pnpm db:reset
```

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/associationhub"
```

## Architecture Notes

- **Single-tenant MVP**: One association per deployment
- **Dynamic roles/groups**: Stored in database tables (not enums) to support different association types
- **Template tags**: Generic ({Nom}, {Role}, {Group}) work for any association type
- **Post-MVP**: Multi-tenant architecture with row-level security
