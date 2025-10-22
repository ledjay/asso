# Data Model: AssociationHub MVP

**Date**: 2025-10-22  
**Feature**: AssociationHub MVP  
**Purpose**: Define database schema and entity relationships

## Overview

This document defines the data model for AssociationHub MVP. The schema is designed to be flexible and support multiple association types through dynamic roles and groups stored in database tables (not enums).

## Core Entities

### User

**Purpose**: Single admin user per association (single-tenant MVP)

**Fields**:
- `id`: String (CUID) - Primary key
- `email`: String - Unique, used for login
- `password`: String - Bcrypt hashed password
- `name`: String - Admin's full name
- `createdAt`: DateTime - Account creation timestamp

**Relationships**:
- Has many `EmailCampaign` (one-to-many)

**Indexes**:
- Unique index on `email`

**Validation**:
- Email must be valid email format
- Password must be at least 8 characters
- Name must not be empty

---

### Role

**Purpose**: Dynamic roles for different association types (stored in DB, not enum)

**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - Unique identifier (e.g., "delegue_titulaire", "entraineur")
- `displayName`: String - Human-readable name (e.g., "Délégué titulaire", "Entraîneur")
- `sortOrder`: Int - Display order in UI

**Relationships**:
- Has many `Member` (one-to-many)

**Indexes**:
- Unique index on `name`

**Validation**:
- Name must be unique
- DisplayName must not be empty
- SortOrder must be >= 0

**Seeded Data** (based on template selection):
- **Parents d'élèves**: Délégué titulaire, Délégué suppléant, Membre
- **Sports Club**: Entraîneur, Joueur, Parent
- **Cultural Association**: Président, Membre actif, Membre

---

### GroupType

**Purpose**: Dynamic groups for different association types (classes, teams, sections)

**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - Unique identifier (e.g., "6e1", "poussins", "debutant")
- `category`: String - Group category (e.g., "classe", "equipe", "section")

**Relationships**:
- Has many `Member` (one-to-many)

**Indexes**:
- Unique index on `name`
- Index on `category` (for filtering)

**Validation**:
- Name must be unique
- Category must not be empty

**Seeded Data** (based on template selection):
- **Parents d'élèves**: 6e1, 5e2, CM2, CE1 (category: "classe")
- **Sports Club**: Poussins, Cadets, U12, Lundi 18h (category: "equipe")
- **Cultural Association**: Débutant, Intermédiaire, Expert (category: "section")

---

### Member

**Purpose**: Individual belonging to the association

**Fields**:
- `id`: String (CUID) - Primary key
- `name`: String - Member's full name
- `email`: String - Unique email address
- `roleId`: String - Foreign key to Role
- `groupId`: String - Foreign key to GroupType
- `createdAt`: DateTime - Member creation timestamp

**Relationships**:
- Belongs to `Role` (many-to-one)
- Belongs to `GroupType` (many-to-one)

**Indexes**:
- Unique index on `email`
- Index on `roleId` (for filtering by role)
- Index on `groupId` (for filtering by group)

**Validation**:
- Name must not be empty
- Email must be valid email format and unique
- RoleId must reference existing Role
- GroupId must reference existing GroupType

**CSV Import Format**:
```csv
name,email,role,group
Jean Dupont,jean.dupont@example.com,delegue_titulaire,6e1
Marie Martin,marie.martin@example.com,delegue_suppleant,5e2
```

---

### EmailCampaign

**Purpose**: Record of a mass email sent to members

**Fields**:
- `id`: String (CUID) - Primary key
- `subject`: String - Email subject line
- `bodyTemplate`: String (Text) - Email body with template tags
- `attachmentUrl`: String? - Optional URL to PDF attachment (Vercel Blob)
- `recipientCount`: Int - Number of recipients
- `sentAt`: DateTime - Email send timestamp
- `userId`: String - Foreign key to User

**Relationships**:
- Belongs to `User` (many-to-one, cascade delete)

**Indexes**:
- Index on `userId` (for filtering by user)
- Index on `sentAt` (for sorting by date)

**Validation**:
- Subject must not be empty
- BodyTemplate must not be empty
- RecipientCount must be > 0
- UserId must reference existing User

**Template Tags**:
- `{Nom}`: Replaced with member's name
- `{Role}`: Replaced with member's role display name
- `{Group}`: Replaced with member's group name

---

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
├──────────────┤
│ id           │
│ email        │◄────────────────┐
│ password     │                 │
│ name         │                 │
│ createdAt    │                 │
└──────────────┘                 │
       │                         │
       │ 1:N                     │
       │                         │
       ▼                         │
┌──────────────────┐             │
│  EmailCampaign   │             │
├──────────────────┤             │
│ id               │             │
│ subject          │             │
│ bodyTemplate     │             │
│ attachmentUrl    │             │
│ recipientCount   │             │
│ sentAt           │             │
│ userId           │─────────────┘
└──────────────────┘


┌──────────────┐         ┌──────────────┐
│     Role     │         │  GroupType   │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ name         │◄───┐    │ name         │◄───┐
│ displayName  │    │    │ category     │    │
│ sortOrder    │    │    └──────────────┘    │
└──────────────┘    │                        │
                    │                        │
                    │ N:1                    │ N:1
                    │                        │
              ┌─────┴──────────┐             │
              │     Member     │             │
              ├────────────────┤             │
              │ id             │             │
              │ name           │             │
              │ email          │             │
              │ roleId         │─────────────┘
              │ groupId        │─────────────┘
              │ createdAt      │
              └────────────────┘
```

---

## Database Migrations

### Initial Migration

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "GroupType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "recipientCount" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GroupType_name_key" ON "GroupType"("name");

-- CreateIndex
CREATE INDEX "GroupType_category_idx" ON "GroupType"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_roleId_idx" ON "Member"("roleId");

-- CreateIndex
CREATE INDEX "Member_groupId_idx" ON "Member"("groupId");

-- CreateIndex
CREATE INDEX "EmailCampaign_userId_idx" ON "EmailCampaign"("userId");

-- CreateIndex
CREATE INDEX "EmailCampaign_sentAt_idx" ON "EmailCampaign"("sentAt");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Seed Data

### Template 1: Parents d'élèves

```typescript
// Roles
await prisma.role.createMany({
  data: [
    { name: 'delegue_titulaire', displayName: 'Délégué titulaire', sortOrder: 1 },
    { name: 'delegue_suppleant', displayName: 'Délégué suppléant', sortOrder: 2 },
    { name: 'membre', displayName: 'Membre', sortOrder: 3 }
  ]
});

// Groups
await prisma.groupType.createMany({
  data: [
    { name: '6e1', category: 'classe' },
    { name: '5e2', category: 'classe' },
    { name: 'CM2', category: 'classe' },
    { name: 'CE1', category: 'classe' }
  ]
});
```

### Template 2: Sports Club

```typescript
// Roles
await prisma.role.createMany({
  data: [
    { name: 'entraineur', displayName: 'Entraîneur', sortOrder: 1 },
    { name: 'joueur', displayName: 'Joueur', sortOrder: 2 },
    { name: 'parent', displayName: 'Parent', sortOrder: 3 }
  ]
});

// Groups
await prisma.groupType.createMany({
  data: [
    { name: 'poussins', category: 'equipe' },
    { name: 'cadets', category: 'equipe' },
    { name: 'u12', category: 'equipe' },
    { name: 'lundi_18h', category: 'equipe' }
  ]
});
```

### Template 3: Cultural Association

```typescript
// Roles
await prisma.role.createMany({
  data: [
    { name: 'president', displayName: 'Président', sortOrder: 1 },
    { name: 'membre_actif', displayName: 'Membre actif', sortOrder: 2 },
    { name: 'membre', displayName: 'Membre', sortOrder: 3 }
  ]
});

// Groups
await prisma.groupType.createMany({
  data: [
    { name: 'debutant', category: 'section' },
    { name: 'intermediaire', category: 'section' },
    { name: 'expert', category: 'section' }
  ]
});
```

---

## Data Validation Rules

### Member Import (CSV)

1. **Required Fields**: name, email, role, group
2. **Email Validation**: Must be valid email format and unique
3. **Role Validation**: Must match existing role name in database
4. **Group Validation**: Must match existing group name in database
5. **Duplicate Detection**: Reject if email already exists

### Email Campaign

1. **Subject**: Required, max 255 characters
2. **Body Template**: Required, supports template tags
3. **Attachment**: Optional, must be PDF, max 5MB
4. **Recipients**: Must have at least 1 recipient
5. **Template Tags**: Must be valid ({Nom}, {Role}, {Group})

---

## Performance Considerations

### Indexes

- **Member.email**: Unique index for fast lookups during import
- **Member.roleId**: Index for filtering members by role
- **Member.groupId**: Index for filtering members by group
- **EmailCampaign.sentAt**: Index for sorting email history

### Query Optimization

- Use `select` to fetch only needed fields
- Use `include` sparingly to avoid N+1 queries
- Batch operations in transactions for CSV import
- Paginate large result sets (members list, email history)

---

## Post-MVP Enhancements

### Soft Delete

Add `deletedAt` field to Member and EmailCampaign for GDPR compliance:

```prisma
model Member {
  // ... existing fields
  deletedAt DateTime?
  
  @@index([deletedAt])
}
```

### Multi-Tenant Support

Add `tenantId` to all entities for row-level security:

```prisma
model Member {
  // ... existing fields
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

### Email Tracking

Add per-recipient tracking:

```prisma
model EmailRecipient {
  id            String   @id @default(cuid())
  campaignId    String
  campaign      EmailCampaign @relation(fields: [campaignId], references: [id])
  memberId      String
  member        Member @relation(fields: [memberId], references: [id])
  status        String   // sent, delivered, bounced, opened
  sentAt        DateTime
  deliveredAt   DateTime?
  openedAt      DateTime?
}
```

---

## Summary

✅ **5 Core Entities**: User, Role, GroupType, Member, EmailCampaign  
✅ **Dynamic Roles/Groups**: Stored in DB tables, not enums  
✅ **3 Templates**: Parents, Sports, Cultural (seeded on first login)  
✅ **Flexible Architecture**: Supports unlimited association types post-MVP  
✅ **Optimized Indexes**: Fast filtering and lookups  
✅ **GDPR-Ready**: Hard delete for MVP, soft delete post-MVP

**Next Step**: Generate API contracts
