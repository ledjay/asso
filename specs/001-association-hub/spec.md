# Feature Specification: AssociationHub - Multi-Tenant Association Management Platform

**Feature Branch**: `001-association-hub`  
**Created**: 2025-10-22  
**Status**: Draft - MVP Scope (4-month solo dev)  
**Input**: User description: "Build an application called AssociationHub which helps associations manage members and communications with ease"

## MVP Scope & Timeline

**Context**: Solo developer with 4-month timeline to build functional MVP.

**Business Model**: Open-source + Freemium SaaS (WordPress model)
- **Open Source**: Self-hosted version (MIT license) - free, unlimited
- **SaaS Hosted**: Managed hosting with freemium tiers
- **MVP**: Single-tenant self-hosted version first
- **Post-MVP**: Multi-tenant SaaS platform

**MVP Focus**: Single-tenant prototype → Multi-tenant SaaS later
- **Month 1**: Auth + Template selection + Member CRUD (many-to-many) + CSV import + Hierarchical groups
- **Month 2**: Email sending (basic SMTP) + filtering (with hierarchy support)
- **Month 3**: Template tags + attachments + basic tracking
- **Month 4**: Polish, testing, deployment, **open-source release**, documentation

**Deferred to Post-MVP**:
- ❌ Multi-tenant architecture (needed for SaaS hosted version)
- ❌ Billing & subscription system (for freemium SaaS tiers)
- ❌ Custom role/group creation UI (MVP has 3 predefined templates)
- ❌ Advanced email tracking (bounces, detailed status)
- ❌ Quota management & rate limiting (for SaaS tiers)
- ❌ Multiple admin users per tenant
- ❌ Concurrent edit detection
- ❌ WCAG AA compliance (aim for good contrast, but not full audit)
- ❌ Comprehensive security logging

**Exceptional UX Requirement** 🎯 (NON-NEGOTIABLE):
Target users are non-technical association admins. Every feature MUST prioritize exceptional user experience:
- **Intuitive**: Zero learning curve - users understand instantly
- **Forgiving**: Undo actions, clear confirmations, prevent errors
- **Delightful**: Smooth animations, instant feedback, celebratory moments
- **Accessible**: Mobile-first, readable contrast, keyboard navigation
- **Helpful**: Contextual guidance, clear error messages, examples provided

**UX Philosophy**: "My grandmother should be able to send an email to 200 parents without calling me"

**Architectural Flexibility Requirement** ⚠️:
Even though MVP hardcodes parent association roles and group types, the codebase MUST be structured to support different association types post-MVP:
- **Roles**: Parent associations (délégué titulaire, suppléant, membre) vs Sports clubs (président, entraîneur, joueur) vs Cultural associations (membre actif, membre honoraire)
- **Groups/Levels**: Parent associations (classes: 6e1, 4e2) vs Football clubs (équipes: poussins, cadets; horaires: lundi, dimanche) vs Chess clubs (niveaux: débutant, intermédiaire, expert)

**Implementation Strategy**:
- Use database enums/tables for roles and group types (not hardcoded strings in code)
- Abstract role/group logic into configurable data structures
- Template tags ({Role}, {Group}) remain generic
- UI labels and filters driven by data, not hardcoded

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tenant Onboarding & First Email (Priority: P1)

A new association administrator (e.g., parent association president) needs to set up their organization and send their first communication to members without technical assistance.

**Why this priority**: This is the critical path that proves the platform's core value proposition - enabling non-technical users to manage communications independently. Without this working end-to-end, the platform has no value.

**Independent Test**: Can be fully tested by creating a new tenant account, selecting a template (parents d'élèves), importing a small CSV of members, and sending a test email with attachment to a filtered group. Delivers immediate value as a working communication tool.

**Acceptance Scenarios**:

1. **Given** a new user visits the platform, **When** they sign up for a new association account, **Then** they complete authentication and proceed to template selection
2. **Given** the template selection page, **When** the user selects one of three templates (Parents d'élèves, Sports club, or Cultural association), **Then** the system seeds the database with appropriate roles and group types for that association type
3. **Given** template is configured, **When** user provides their SMTP credentials (Gmail app password or other provider), **Then** credentials are validated and stored securely
4. **Given** SMTP is configured, **When** user uploads a CSV file with 200 members (name, email, role, group), **Then** all valid members are imported within 10 minutes with clear error reporting for invalid rows
5. **Given** members are imported, **When** user composes an email with subject, body containing template tags ({Nom}, {Role}, {Group}), attaches a PDF file, filters recipients by "délégué titulaire" in "CM2", and sends, **Then** emails are queued and sent to matching recipients with personalized content within 5 minutes

---

### User Story 2 - Member Management & Filtering (Priority: P2)

An association administrator needs to view, search, filter, and manage their member database to understand their membership composition and target specific groups.

**Why this priority**: Once basic communication works (P1), admins need to manage their member data effectively. This enables more sophisticated use cases like targeted communications and member analytics.

**Independent Test**: Can be tested by importing a diverse member list, then using filters to find specific subsets (e.g., all delegates, all members in a specific class, members with specific roles). Delivers value as a member directory and segmentation tool.

**Acceptance Scenarios**:

1. **Given** a tenant with imported members, **When** admin views the member list, **Then** they see a paginated table with name, email, role, and group columns
2. **Given** the member list, **When** admin applies filter "role = délégué titulaire", **Then** only members with that role are displayed
3. **Given** the member list, **When** admin applies combined filters "role = membre AND group = CE1", **Then** only members matching both criteria are displayed
4. **Given** filtered results, **When** admin selects "Send email to selection", **Then** the email composer opens with recipients pre-populated from the filter
5. **Given** a member record, **When** admin clicks edit, updates the email address, and saves, **Then** the member record is updated and reflected immediately in the list
6. **Given** a member record, **When** admin clicks delete and confirms, **Then** the member is soft-deleted and no longer appears in active member lists

---

### User Story 3 - Email Sending with Basic Tracking (Priority: P1 - MVP)

An association administrator needs to send personalized emails with attachments and see basic confirmation that emails were sent.

**Why this priority**: Core value proposition - sending communications. MVP version focuses on "it works" rather than enterprise-grade tracking.

**Independent Test**: Can be tested by composing an email with template tags, attaching a file, sending to filtered recipients, and seeing a simple "sent" confirmation.

**Acceptance Scenarios**:

1. **Given** the email composer, **When** admin types "Bonjour {Nom}, en tant que {Role} de la {Group}", **Then** template tags are replaced with actual member data when sent
2. **Given** an email draft, **When** admin attaches a single PDF file (< 5MB), **Then** the file is uploaded and included in email
3. **Given** a composed email with recipients, **When** admin clicks "Send", **Then** emails are sent and admin sees "X emails sent successfully" message
4. **Given** emails were sent, **When** admin views email history, **Then** they see a simple list of past sends with date, subject, and recipient count

**MVP Simplifications**:
- No per-recipient status tracking (just "sent" confirmation)
- No bounce handling (defer to post-MVP)
- No quota management (trust SMTP provider limits)
- Single attachment only (not multiple)
- Synchronous sending for MVP (async queue in post-MVP)

---

### User Story 4 - Many-to-Many Roles and Hierarchical Groups (Priority: P1 - MVP Critical)

An association administrator needs members to have multiple roles and belong to multiple groups, with groups organized in a hierarchical structure (parent-child relationships).

**Why this priority**: Real-world associations REQUIRE members with multiple responsibilities (e.g., a parent who is both "Délégué titulaire" for one class and "Membre" for another) and hierarchical group structures (e.g., "6ème" → "6ème 1", "6ème 2"). This is NOT optional - it's how associations actually work in practice. Without this, the platform cannot handle real-world use cases.

**Independent Test**: Can be tested by assigning multiple roles to a member, creating a hierarchical group structure (e.g., "Football" → "U12" → "Équipe A"), filtering emails by parent groups (automatically including children), and verifying that circular references are prevented.

**Acceptance Scenarios**:

1. **Given** a member record, **When** admin assigns multiple roles (e.g., "Délégué titulaire" and "Membre"), **Then** the member appears in filters for both roles
2. **Given** a member record, **When** admin assigns multiple groups (e.g., "6ème 1" and "5ème 2"), **Then** the member appears in filters for both groups
3. **Given** group management, **When** admin creates a parent group "6ème" with child groups "6ème 1", "6ème 2", "6ème 3", **Then** groups are displayed in an indented list showing the hierarchy
4. **Given** hierarchical groups exist, **When** admin filters emails by parent group "6ème" with "Include children" checked, **Then** all members in "6ème 1", "6ème 2", and "6ème 3" are included
5. **Given** a group with a parent, **When** admin tries to set that group's child as its parent (circular reference), **Then** system prevents the change with clear error message
6. **Given** a group hierarchy, **When** admin tries to create a 4th level (exceeding 3-level limit), **Then** system prevents the change with clear error message
7. **Given** CSV import, **When** CSV contains comma-separated roles and groups (e.g., "delegue_titulaire,membre" and "6e1,5e2"), **Then** member is assigned all specified roles and groups
8. **Given** member list, **When** viewing a member with multiple roles/groups, **Then** all roles and groups are displayed as badges

**Implementation Phases**:
- **Phase 1** (1-2 days): Many-to-many relationships (junction tables, multi-select UI, filtering)
- **Phase 2** (1-2 days): Hierarchical groups (parent-child relations, indented display, descendant filtering, validation)

**Database Changes**:
- Add `MemberRole` junction table (memberId, roleId, assignedAt)
- Add `MemberGroup` junction table (memberId, groupId, joinedAt)
- Add `parentId` field to `GroupType` for self-referential hierarchy
- Remove `roleId` and `groupId` from `Member` table

**UI Changes**:
- Multi-select dropdowns for roles and groups in member edit dialog
- Indented list display for hierarchical groups (padding based on depth)
- "Include child groups" checkbox in email filters
- Multiple badge display in member table

**Validation Rules**:
- Maximum hierarchy depth: 3 levels (configurable)
- Circular reference prevention (A → B → A not allowed)
- Unique member-role and member-group combinations

---

### Edge Cases (MVP Scope)

**Must Handle**:
- **What happens when CSV import contains duplicate emails?** Show warning, last entry wins (simple approach)
- **What happens when SMTP credentials are invalid?** Show error message when trying to send, prompt to update settings
- **What happens when an email attachment exceeds size limits?** Reject file with clear error (5MB limit for MVP)
- **What happens when CSV contains invalid email formats?** Skip invalid rows, show count of skipped rows after import
- **What happens when admin forgets password?** Standard NextAuth password reset flow
- **What happens when tenant wants to export their member data?** CSV export button on member list

**Deferred to Post-MVP**:
- ❌ Duplicate resolution UI (just overwrite for MVP)
- ❌ Bounce tracking and member flagging
- ❌ Quota management and queueing
- ❌ Concurrent edit detection
- ❌ SMTP rate limiting and retry logic (rely on provider)
- ❌ Multiple file attachments

### Edge Cases (Many-to-Many & Hierarchical Groups - MVP)

**Must Handle**:
- **What happens when admin tries to create a circular group reference?** Validate on save, show error: "Cannot set [Group A] as parent - would create circular reference"
- **What happens when admin tries to create a 4th level in group hierarchy?** Prevent with error: "Maximum hierarchy depth of 3 levels reached"
- **What happens when filtering by parent group with "Include children" unchecked?** Only members directly in parent group are included
- **What happens when a member has multiple roles and admin filters by one role?** Member appears in results if they have any matching role
- **What happens when CSV contains both old format (single role/group) and new format (multiple)?** Support both - detect comma-separated values and handle accordingly
- **What happens when admin deletes a parent group?** Cascade delete to all children (with confirmation dialog showing affected groups)
- **What happens when displaying a member with 5+ roles/groups?** Show first 3 badges + "+2 more" with tooltip/modal showing all
- **What happens when admin tries to assign duplicate role to same member?** Prevent with unique constraint, show friendly error
- **What happens when email template uses {Role} tag for member with multiple roles?** Use first/primary role, or comma-separated list (to be decided during implementation)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication (MVP: Single Tenant)
- **FR-001**: System MUST provide secure authentication using NextAuth with email and password
- **FR-002-MVP**: System MUST support single-tenant deployment (one association per deployment instance)
- **FR-005**: System MUST support password reset functionality

**Post-MVP**: Multi-tenant architecture with row-level security

#### Onboarding & Configuration (MVP: Template Selection)
- **FR-006-MVP**: System MUST provide simple settings page for SMTP configuration
- **FR-007-MVP**: System MUST present template selection on first login with three options:
  - **Parents d'élèves**: Roles (Délégué titulaire, Délégué suppléant, Membre) | Group label: "Classes" (examples: 6e1, 5e2, CM2)
  - **Sports club**: Roles (Entraîneur, Joueur, Parent) | Group label: "Équipes/Niveaux" (examples: Poussins, Cadets, U12)
  - **Cultural association**: Roles (Président, Membre actif, Membre) | Group label: "Sections" (examples: Débutant, Intermédiaire, Expert)
- **FR-007a**: System MUST seed database with selected template's roles and group types as database records
- **FR-007b-ARCH**: System MUST store roles and group types in database tables (not hardcoded in application code) to enable future customization
- **FR-007c**: Template selection MUST be one-time only (no switching after selection in MVP)
- **FR-010-MVP**: System MUST allow SMTP configuration with basic validation (test send)

**Post-MVP Roadmap** (phased approach):
- **Phase 1**: Custom role/group creation UI (admin can customize their own association)
- **Phase 2**: Template creation (admin can save their config as reusable template)
- **Phase 3**: Template marketplace (admins can share/discover community templates)
- **Phase 4**: Template versioning and migration tools

**Architectural Note**: Roles stored as database records, not enums, to support different association types. Template data model designed to support user-generated templates from day one (see Key Entities).

#### Member Data Management (MVP Core)
- **FR-011**: System MUST support CSV import of member data with fields: name, email, role, group
- **FR-012-MVP**: System MUST validate email format during import and skip invalid rows
- **FR-013-MVP**: System MUST handle CSV import of at least 200 members (performance not critical for MVP)
- **FR-015**: System MUST support manual member creation, editing, and deletion via UI
- **FR-016-MVP**: System MUST implement hard delete for MVP (soft delete in post-MVP)
- **FR-017**: System MUST support member list viewing with pagination
- **FR-018**: System MUST support filtering members by role and/or group
- **FR-019**: System MUST support searching members by name or email
- **FR-020**: System MUST support CSV export of member data

**Simplified for MVP**: Basic error messages (not row-by-row), hard delete, simple filters

#### Member Data Management (MVP: Many-to-Many & Hierarchical Groups)
- **FR-021-MVP**: System MUST support members having multiple roles simultaneously via junction table
- **FR-022-MVP**: System MUST support members belonging to multiple groups simultaneously via junction table
- **FR-023-MVP**: System MUST support hierarchical group structures with parent-child relationships (self-referential)
- **FR-024-MVP**: System MUST limit group hierarchy to maximum 3 levels (configurable)
- **FR-025-MVP**: System MUST prevent circular references in group hierarchy (A → B → A)
- **FR-026-MVP**: System MUST validate circular references when creating or updating group parent relationships
- **FR-027-MVP**: System MUST display groups in indented list format showing hierarchy depth
- **FR-028-MVP**: System MUST support "Include child groups" option in email filters
- **FR-029-MVP**: System MUST automatically include all descendant groups when filtering by parent group (if option enabled)
- **FR-030-MVP**: System MUST support CSV import with comma-separated roles and groups (e.g., "role1,role2" and "group1,group2")
- **FR-031-MVP**: System MUST display multiple role and group badges in member list
- **FR-032-MVP**: System MUST provide multi-select dropdowns for roles and groups in member edit dialog
- **FR-033-MVP**: System MUST maintain data integrity with unique constraints on member-role and member-group combinations
- **FR-034-MVP**: System MUST support backward-compatible CSV format (single role/group) alongside new format (multiple)

**Implementation Note**: Junction tables (`MemberRole`, `MemberGroup`) replace direct foreign keys from day one. Group hierarchy uses self-referential `parentId` field on `GroupType` table. This is the ONLY data model - no migration needed.

#### Email & Communication (MVP: Basic but Functional)
- **FR-021-MVP**: System MUST support SMTP configuration stored in encrypted database (BYO SMTP is critical for MVP)
- **FR-022-MVP**: System MUST validate SMTP credentials with test send button
- **FR-023**: System MUST support Gmail SMTP with app passwords and standard SMTP providers
- **FR-024-MVP**: System MUST support email composition with subject, body, and single file attachment (< 5MB)
- **FR-025**: System MUST support template tags in email body: {Nom}, {Role}, {Group} with personalization per recipient
- **FR-027**: System MUST support recipient selection via member filters (role, group)
- **FR-028-MVP**: System MUST send emails synchronously for MVP (show loading state)
- **FR-031-MVP**: System MUST provide simple email history (date, subject, recipient count)

**Post-MVP**: Multiple attachments, async queue, per-recipient tracking, quota management, retry logic, bounce handling

#### Security & Compliance (MVP: Basics)
- **FR-035-MVP**: System MUST store SMTP credentials encrypted in database with proper key management
- **FR-037**: System MUST validate all user inputs to prevent injection attacks (Prisma + Zod)
- **FR-038-MVP**: System MUST use NextAuth rate limiting defaults
- **FR-040-MVP**: System MUST support data deletion (hard delete for MVP)

**Post-MVP**: Encrypted DB storage, comprehensive logging, row-level security for multi-tenant, GDPR audit trail

#### User Experience (MVP: Exceptional UX - NON-NEGOTIABLE)
- **FR-041**: System MUST provide exceptional UI with:
  - Clean, uncluttered layouts (one primary action per screen)
  - Readable contrast (WCAG AA minimum)
  - Smooth transitions and micro-interactions
  - Mobile-first responsive design
- **FR-042**: System MUST use plain language with:
  - Zero technical jargon (no "SMTP", say "Email Configuration" / "Configuration email")
  - Action-oriented labels ("Send Email" / "Envoyer l'email" not "Submit" / "Soumettre")
  - Conversational tone ("Perfect! Your members are imported" / "Parfait! Vos membres sont importés")
  - MVP launches in French, English support added post-MVP
  - All UI strings externalized via i18n library (next-intl or similar)
- **FR-043**: System MUST provide contextual guidance:
  - Inline examples ("Ex: 6e1, CM2" next to group field)
  - Tooltips for complex features (hover/tap for explanation)
  - Empty states with clear next actions ("Commencez par importer vos membres")
- **FR-044**: System MUST show exceptional feedback:
  - Loading states with progress ("Import en cours... 45/200 membres")
  - Success celebrations (confetti animation on first email sent)
  - Optimistic UI (instant feedback, sync in background)
- **FR-045**: System MUST provide helpful error messages:
  - Explain what went wrong in plain language
  - Suggest specific fix ("Vérifiez que votre fichier CSV contient les colonnes: nom, email, role, groupe")
  - Offer alternative actions ("Ou créez vos membres manuellement")
- **FR-046**: System MUST prevent user errors:
  - Confirmation dialogs for destructive actions ("Supprimer 50 membres?")
  - Validation before submission (highlight missing fields)
  - Undo capability for recent actions ("Annuler l'import")
- **FR-047**: System MUST provide keyboard shortcuts for power users:
  - Cmd/Ctrl+K for quick search
  - Escape to close modals
  - Tab navigation through forms
- **FR-048-ARCH**: ✅ **IMPLEMENTED** - System MUST be i18n-ready from day one:
  - ✅ All UI strings externalized using translation keys (next-intl)
  - ✅ English translations prepared alongside French (106 keys in both languages)
  - ✅ Code, comments, and variable names in English
  - ✅ NextIntl provider configured in root layout
  - ✅ Translation files: `locales/fr.json` and `locales/en.json`
  - ✅ All components refactored: Login, Dashboard, Members, Email Composer, Settings, Template Selection
  - 🔄 Date/time formatting locale-aware (architecture ready, to be implemented when needed)
  - 🔄 Number formatting locale-aware (architecture ready, to be implemented when needed)
  
  **Implementation Status**: 100% complete for MVP
  - 10 components fully translated
  - 106 translation keys (Auth: 10, Common: 13, Dashboard: 12, Members: 30, Emails: 31, Templates: 9, Settings: 11)
  - Zero hardcoded strings in user-facing UI
  - Architecture supports adding Spanish, German, Italian, etc. post-MVP

**Post-MVP**: Language switcher UI, user preference storage, URL-based locale routing, advanced animations, onboarding tour, video tutorials, AI-powered suggestions

### Key Entities

- **User**: Single admin user for MVP (NextAuth). Attributes: email, hashed password, name. Multi-tenant admin model deferred to post-MVP.

- **Member**: Individual belonging to the association. Attributes: name, email, created date. Relationships: multiple roles (via MemberRole junction), multiple groups (via MemberGroup junction). Simplified for MVP - no soft delete, no bounce tracking.

- **EmailCampaign**: Record of a mass email sent. Attributes: subject, body template, attachment URL (S3/Vercel Blob), sender user ID, created timestamp, recipient count. Simplified for MVP - no per-recipient tracking.

- **SMTPConfiguration**: SMTP credentials for sending emails. Attributes: host, port, username, encrypted password, from address, user ID. **MVP Entity** - BYO SMTP is critical for self-hosted deployments. Credentials encrypted at rest using encryption key from environment.

- **Role** (MVP): Database table for association roles. Attributes: name, display_name, sort_order. MVP seeds from 3 hardcoded templates, post-MVP allows custom creation.

- **GroupType** (MVP): Database table for group categories. Attributes: name, category (classe/équipe/section), **parentId** (nullable, for hierarchy). MVP seeds from 3 hardcoded templates with hierarchical structures, post-MVP allows custom creation.

- **MemberRole** (MVP - Many-to-Many): Junction table linking members to roles. Attributes: id, memberId, roleId, assignedAt. Enables members to have multiple roles simultaneously from day one.

- **MemberGroup** (MVP - Many-to-Many): Junction table linking members to groups. Attributes: id, memberId, groupId, joinedAt. Enables members to belong to multiple groups simultaneously from day one.

**Post-MVP Entities**: 
- **Template** (critical for business scaling): Represents a reusable association configuration. Attributes: name, description, creator user ID, role definitions (JSON), group type definitions (JSON), is_public (shareable), usage_count, created_at. Enables user-generated templates and marketplace.
- **EmailDelivery**: Per-recipient tracking
- **ImportJob**: Detailed CSV import tracking

**Data Model** (MVP from day one):
- Member has multiple roles and groups via junction tables
- Groups support parent-child hierarchy (3 levels max)
- No migration needed - this is the base architecture

## Success Criteria *(mandatory)*

### Measurable Outcomes

**MVP Success Criteria** (4-month solo dev):

- **SC-001-MVP**: Admin can configure SMTP settings and send first test email within 10 minutes
- **SC-002-MVP**: Admin can import 200 members via CSV and see them in member list
- **SC-003-MVP**: Admin can compose, personalize, attach file, and send email to filtered group within 5 minutes
- **SC-004-MVP**: Email personalization (template tags) renders correctly in 100% of sent emails
- **SC-005-MVP**: System works reliably for single association with up to 500 members
- **SC-006-MVP**: UI is exceptional - 90% of users complete first email send without help or confusion
- **SC-007-MVP**: Mobile experience is delightful - all features work perfectly on smartphone
- **SC-008-MVP**: Error recovery is smooth - users can fix mistakes without frustration
- **SC-009-MVP**: ✅ **ACHIEVED** - i18n architecture is complete - all UI strings use translation keys, supporting French (active) and English (ready), with zero refactoring needed to add new languages

**Post-MVP Success Criteria**:
- ❌ Multi-tenant isolation (single-tenant for MVP)
- ❌ Encrypted credential storage (env vars for MVP)
- ❌ Per-recipient delivery tracking (simple "sent" confirmation for MVP)
- ❌ WCAG AAA compliance (AA minimum in MVP)
- ❌ Concurrent tenant performance (single-tenant MVP)
- ❌ Sub-second page loads (< 2s acceptable for MVP on 3G)

**Many-to-Many & Hierarchical Groups Success Criteria** (MVP):
- **SC-010-MVP**: Admin can assign multiple roles to a member and filter emails by any role
- **SC-011-MVP**: Admin can assign multiple groups to a member and filter emails by any group
- **SC-012-MVP**: Admin can create 3-level group hierarchy (e.g., "Football" → "U12" → "Équipe A")
- **SC-013-MVP**: System prevents circular references with clear error messages
- **SC-014-MVP**: Filtering by parent group automatically includes all child group members when "Include children" is checked
- **SC-015-MVP**: CSV import supports both single and multiple roles/groups formats
- **SC-016-MVP**: Member list clearly displays all roles and groups for each member
- **SC-017-MVP**: Hierarchy validation prevents exceeding 3-level depth limit
- **SC-018-MVP**: Group hierarchy is displayed in intuitive indented list format

### Assumptions

**MVP Assumptions** (4-month timeline):

- **Assumption 1**: MVP is single-tenant self-hosted version (open-source)
  - Users deploy on their own infrastructure (Vercel, Railway, self-hosted)
  - No billing or subscription system in MVP
  - Multi-tenant SaaS version comes post-MVP
- **Assumption 2**: Admin has SMTP credentials and can configure them via in-app settings page (stored encrypted in database)
- **Assumption 3**: CSV format is documented and admin can format their data correctly
- **Assumption 4**: MVP launches in French, but codebase is i18n-ready:
  - All UI strings use translation keys (not hardcoded)
  - English translations prepared but not exposed in MVP
  - Language switcher added post-MVP
  - Code, comments, and variable names in English
- **Assumption 5**: Single PDF attachment per email (< 5MB) is sufficient
- **Assumption 6**: Association has < 500 members (performance not critical for MVP)
- **Assumption 7**: Admin is comfortable with basic tech setup (SMTP config, CSV format)
- **Assumption 8**: Deployment options:
  - **Self-hosted** (open-source): Vercel, Railway, Docker, or any Node.js host
  - **SaaS** (post-MVP): Managed multi-tenant platform
  - MVP uses Vercel Postgres and Vercel Blob (can be swapped for alternatives)
- **Assumption 9**: Synchronous email sending is acceptable (< 50 recipients per send)
- **Assumption 10**: Mobile-first responsive UI with exceptional UX (works beautifully on all devices)
- **Assumption 12**: UX is a core differentiator - users choose platform because it's delightful to use, not just functional
- **Assumption 11**: MVP supports 3 association templates (parents, sports, cultural) via simple selection page, validating multi-type architecture early

**Post-MVP Assumptions to Revisit**:
- **SaaS Hosted Version**:
  - Multi-tenant architecture with row-level security
  - Billing & subscription system (Stripe integration)
  - **Pricing model validation** (current $19/$99 pricing is hypothesis, needs market testing)
  - Freemium tiers (Free: 100 members, Pro: 500 members, Enterprise: unlimited)
  - Tier limits validation (are 100/500 members the right thresholds?)
  - Centralized SMTP (no BYO SMTP for free tier)
  - Usage analytics and admin dashboard
- Async email queue for larger sends
- Encrypted credential storage in database
- Configurable roles and group types per association type (UI for customization)
- **Internationalization** (i18n):
  - MVP: French only, but architecture supports multiple languages
  - Post-MVP: Add English, then other languages (Spanish, German, etc.)
  - Language switcher in user settings
  - RTL support for Arabic/Hebrew (future)
- **User-generated templates** (critical for business scaling):
  - Phase 1: Custom role/group creation for own association
  - Phase 2: Save custom config as reusable template
  - Phase 3: Template marketplace for sharing/discovering community templates
  - Enables unlimited association types without dev intervention

**Architectural Constraints for Flexibility**:
1. **Roles**: Store in `Role` table with `name` and `displayName` fields, seeded based on template selection
2. **Groups**: Store in `GroupType` table with `name` and `category` fields, seeded based on template selection
3. **Template Tags**: Keep generic ({Role}, {Group}, {Nom}) - work for any association type
4. **Filters**: Build dynamically from database roles/groups, not hardcoded dropdowns
5. **CSV Import**: Validate against current roles/groups in database, not hardcoded enums
6. **Template Selection**: One-time choice on first login, seeds database with predefined role/group sets
7. **Template Entity** (post-MVP): Design `Template` table now to support user-generated templates later:
   - Stores role/group definitions as JSON
   - Links to creator user (for marketplace attribution)
   - Public/private flag for sharing
   - MVP uses 3 hardcoded templates, post-MVP enables user creation

**MVP Templates** (selectable on first login):
- **Parents d'élèves**: Roles: Délégué titulaire, Délégué suppléant, Membre; Groups: Classes (6e1, 5e2, CM2, CE1)
- **Sports Club**: Roles: Entraîneur, Joueur, Parent; Groups: Équipes/Niveaux (Poussins, Cadets, U12, Lundi 18h)
- **Cultural Association**: Roles: Président, Membre actif, Membre; Groups: Sections (Débutant, Intermédiaire, Expert)

**Post-MVP Vision** (critical for business scaling):
- **Phase 1**: Custom role/group creation UI (admins customize their own association)
- **Phase 2**: Template creation (admins save config as reusable template)
- **Phase 3**: Template marketplace:
  - Discover community-created templates (e.g., "Theater Club", "Music School", "Hiking Club")
  - Template ratings and usage stats
  - One-click template adoption
  - Template versioning and updates
- **Phase 4**: More predefined templates (theater, music, martial arts, etc.)
- **Business Impact**: Enables platform to support unlimited association types without dev intervention, creates network effects through template sharing

## Business Model & Licensing

### Open Source + Freemium SaaS (WordPress Model)

**Two Deployment Options**:

#### 1. Self-Hosted (Open Source) - AssociationHub.org
- **License**: MIT (permissive, commercial-friendly)
- **Cost**: Free forever
- **Features**: Full feature set, no limitations
- **Requirements**: User provides own infrastructure (Vercel, Railway, Docker, VPS)
- **SMTP**: BYO SMTP (user configures their own)
- **Storage**: User configures (Vercel Blob, S3, local)
- **Support**: Community support (GitHub issues, Discord)
- **Target**: Tech-savvy associations, developers, cost-conscious users

#### 2. SaaS Hosted (Managed) - AssociationHub.com (Post-MVP)
- **License**: Proprietary (closed-source SaaS platform)
- **Tiers** (⚠️ **PRICING SUBJECT TO MARKET VALIDATION**):
  - **Free**: 50 members, 25 emails/month, community support
  - **Starter** (€5/month): 200 members, 200 emails/month, email support
  - **Pro** (€10/month): 500 members, 1000 emails/month, email support, custom domain
  - **Premium** (€15/month): Unlimited members/emails, priority support, custom domain, white-label
  - **Impact** (Free): Unlimited for impactful social projects (application required)
- **Features**: Same as open-source + managed hosting, automatic updates, backups
- **SMTP**: Centralized (Free/Starter), BYO SMTP (Pro+)
- **Storage**: 500MB (Free), 2GB (Starter), 10GB (Pro), Unlimited (Premium/Impact)
- **Support**: Community (Free), Email (Starter/Pro), Priority (Premium/Impact)
- **Target**: Non-technical users, associations wanting zero maintenance

**Note**: Pricing reflects European association market (€5-15/month range based on market insight). Must be validated through:
- User interviews with target associations
- Willingness-to-pay surveys (Van Westendorp)
- Beta pricing experiments
- Competitor benchmarking (European market: HelloAsso, Yapla, etc.)
- Cost analysis (infrastructure, support, etc.)

### Why This Model Works

**For Users**:
- **Choice**: Self-host for control, SaaS for convenience
- **No Lock-in**: Can migrate between self-hosted and SaaS
- **Trust**: Open-source code = transparency and security

**For Business**:
- **Community Growth**: Open-source drives adoption and contributions
- **Revenue**: SaaS subscriptions from convenience-seeking users
- **Network Effects**: Template marketplace benefits both versions
- **Competitive Moat**: Community + brand + managed infrastructure

### MVP Licensing Strategy

**Month 4 Deliverables**:
1. ✅ Open-source release on GitHub (MIT license)
2. ✅ **Bilingual documentation** (English first, French second) for self-hosting
3. ✅ README with clear setup instructions (EN primary: `/README.md`, FR: `/README.fr.md`)
4. ✅ Contributing guidelines (EN: `/CONTRIBUTING.md`, FR: `/CONTRIBUTING.fr.md`)
5. ✅ Code of conduct (EN: `/CODE_OF_CONDUCT.md`, FR: `/CODE_OF_CONDUCT.fr.md`)
6. ✅ License file (LICENSE - MIT)
7. ✅ Developer documentation (architecture, API, database schema - English only)
8. ✅ Deployment guides (Vercel, Railway, Docker, VPS - EN first, FR second)

**Post-MVP SaaS Launch** (~2-3 months after open-source):
1. **Pricing validation** (user interviews, surveys, competitor analysis)
2. Multi-tenant architecture
3. Billing integration (Stripe)
4. Freemium tier limits (validated thresholds)
5. Managed hosting infrastructure
6. Marketing site (AssociationHub.com)
7. Beta pricing experiments (A/B test different price points)

### Open-Source Documentation (Bilingual FR/EN)

**Critical for Adoption**: Comprehensive, up-to-date documentation in French and English is NON-NEGOTIABLE for open-source success.

**Documentation Philosophy**: "If it's not documented, it doesn't exist"

**Required Documentation** (Month 4 MVP):

#### 1. README.md (EN first, FR second)
- **English**: `/README.md` (primary, standard for open-source)
- **French**: `/README.fr.md` (French market support)
- **Contents**:
  - Project description and features
  - Quick start (5 minutes to running locally)
  - Screenshots/demo GIF
  - Tech stack overview
  - Link to full documentation
  - Contribution guidelines link
  - License and community links
- **Language switcher**: Badge at top linking to other language

#### 2. Setup & Deployment Guides
- **Location**: `/docs/` directory with `/docs/en/` (primary) and `/docs/fr/` (secondary) subdirectories
- **Priority**: Write English first, then translate to French
- **Guides Required**:
  - **Getting Started** (`getting-started.md`): Prerequisites, installation, first run
  - **Vercel Deployment** (`deploy-vercel.md`): One-click deploy, environment variables
  - **Railway Deployment** (`deploy-railway.md`): Railway setup, database config
  - **Docker Deployment** (`deploy-docker.md`): Dockerfile, docker-compose, production setup
  - **VPS Deployment** (`deploy-vps.md`): Ubuntu/Debian setup, Nginx, PM2, SSL
  - **Environment Variables** (`environment.md`): All env vars explained with examples

#### 3. Developer Documentation
- **Location**: `/docs/dev/` (English only for developers)
- **Contents**:
  - **Architecture** (`architecture.md`): Monorepo structure, package responsibilities
  - **Database Schema** (`database.md`): Prisma schema, migrations, seeding
  - **API Reference** (`api.md`): All API routes, request/response examples
  - **Component Library** (`components.md`): Storybook link, component usage
  - **Testing** (`testing.md`): Running tests, writing tests, coverage
  - **Contributing** (`contributing.md`): Development workflow, PR process, code style

#### 4. User Guides (EN first, FR second)
- **Location**: `/docs/user/en/` (primary) and `/docs/user/fr/` (secondary)
- **Priority**: Write English first, then translate to French
- **Guides**:
  - **Template Selection** (`templates.md`): Choosing the right template
  - **Member Management** (`members.md`): CRUD, CSV import/export
  - **Email Sending** (`emails.md`): Composing, template tags, attachments
  - **SMTP Configuration** (`smtp.md`): Gmail, Outlook, custom SMTP setup
  - **Troubleshooting** (`troubleshooting.md`): Common issues and solutions

#### 5. Community Files
- **CONTRIBUTING.md** (EN first): `/CONTRIBUTING.md` (English), `/CONTRIBUTING.fr.md` (French)
- **CODE_OF_CONDUCT.md** (EN first): `/CODE_OF_CONDUCT.md` (English), `/CODE_OF_CONDUCT.fr.md` (French)
- **SECURITY.md** (EN only): Security policy, vulnerability reporting
- **CHANGELOG.md** (EN only): Version history, breaking changes, migration guides

**Rationale**: English-first is standard for open-source projects, maximizes international reach, French support shows commitment to local market

**Documentation Maintenance**:
- ✅ **Update with every feature**: Documentation PR required for feature PRs (English first)
- ✅ **Translation workflow**: Write/update English docs first, then translate to French
- ✅ **Version-specific docs**: Tag docs with version numbers
- ✅ **Automated checks**: CI fails if docs are outdated (check last modified date)
- ✅ **Community contributions**: Accept doc improvements from community (any language)
- ✅ **Translation sync**: Automated check warns if French docs lag behind English

**Documentation Tooling**:
- **VitePress** or **Docusaurus**: Static site generator for docs
- **Deployed to**: docs.associationhub.org (separate from main site)
- **Search**: Algolia DocSearch for documentation search
- **Versioning**: Docs versioned with releases (v1.0, v1.1, etc.)

**Success Metrics**:
- 90% of self-hosted users complete setup without asking for help
- Average time to first successful deployment: < 30 minutes
- Documentation search queries resolve 80%+ of questions
- Community PRs for doc improvements (sign of engagement)

### Feature Parity

| Feature | Self-Hosted (Open Source) | SaaS Free | SaaS Starter (€5) | SaaS Pro (€10) | SaaS Premium (€15) | SaaS Impact (Free) |
|---------|---------------------------|-----------|-------------------|----------------|--------------------|--------------------|
| **Members** | Unlimited | 50 | 200 | 500 | Unlimited | Unlimited |
| **Emails/month** | Unlimited | 25 | 200 | 1000 | Unlimited | Unlimited |
| **Templates** | 3 predefined + custom | 3 predefined | 3 predefined | 3 predefined + custom | All + custom | All + custom |
| **SMTP** | BYO | Centralized | Centralized | BYO | BYO | BYO |
| **Storage** | User-provided | 500MB | 2GB | 10GB | Unlimited | Unlimited |
| **Support** | Community | Community | Email | Email | Priority | Priority |
| **Custom Domain** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **White-label** | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Updates** | Manual | Automatic | Automatic | Automatic | Automatic | Automatic |
| **Backups** | User-managed | Daily | Daily | Daily | Hourly | Hourly |
| **Annual Discount** | N/A | N/A | 20% (€4/mo) | 20% (€8/mo) | 20% (€12/mo) | N/A |

### Monetization Strategy

**Revenue Streams**:
1. **SaaS Subscriptions**: Primary revenue (Starter/Pro/Premium tiers)
2. **Community Donations**: Impact Fund donations from self-hosted users (funds Impact tier hosting)
3. **Template Marketplace**: Premium templates (future, revenue share with creators)
4. **Professional Services**: Custom development, consulting (future)
5. **Enterprise Support**: Dedicated support contracts (future)

**No Revenue from Open Source**: Self-hosted version remains free forever, drives adoption and community

### Impact Program (Social Mission)

**Mission**: Support associations creating positive social impact by providing free Premium-tier hosting.

**Eligibility Criteria**:
- **Educational**: Schools in disadvantaged areas, literacy programs, STEM education for underserved communities
- **Social Services**: Refugee support, homeless assistance, food banks, community health
- **Environmental**: Local conservation, community gardens, environmental education
- **Youth Development**: After-school programs, mentorship, sports for at-risk youth
- **Cultural Preservation**: Indigenous communities, minority language preservation, cultural heritage

**Application Process**:
1. Submit application via AssociationHub.com/impact
2. Provide: Association description, social impact metrics, budget constraints
3. Review by Impact Committee (quarterly reviews)
4. Approved projects receive Premium tier (unlimited members/emails) for free
5. Annual renewal based on continued impact

**Impact Metrics** (reported annually):
- Number of beneficiaries served
- Geographic reach
- Social outcomes achieved
- Budget allocation (% spent on mission vs overhead)

**Benefits for AssociationHub**:
- **Brand Goodwill**: Demonstrates commitment to social mission
- **PR & Marketing**: Success stories, case studies, media coverage
- **Community Building**: Engaged user base, testimonials, referrals
- **Community Funding**: Self-hosted users donate to Impact Fund (sustainable model)
- **Transparent Impact**: Public reporting on donations and projects supported
- **Tax Benefits**: Charitable contributions (depending on legal structure)
- **Talent Attraction**: Mission-driven employees and contributors

**Donation Fund Transparency** (public dashboard):
- Total donations received (monthly/yearly)
- Number of Impact projects supported
- Hosting costs covered by donations
- Success stories from funded projects
- Donor recognition (optional, with permission)

**Community Donation Fund**:
- Self-hosted users can donate to Impact Fund via AssociationHub.com/donate
- Donations fund hosting costs for Impact tier associations
- Transparent reporting: Show how much donated, how many projects supported
- Donor recognition: Optional public thank you on website (with permission)
- Tax receipts: Provide donation receipts (depending on legal structure)

**Virtuous Cycle**:
1. Open-source users benefit from free software
2. Some donate to Impact Fund (pay it forward)
3. Donations fund hosting for impactful social projects
4. Impact projects create success stories
5. Success stories attract more users and donors

**Post-MVP Launch**: Impact program and donation fund launch alongside SaaS (builds brand from day one)

### Pricing Validation (Pre-SaaS Launch)

**Critical Questions to Answer**:
1. **Willingness to Pay**: What would associations pay for managed hosting vs self-hosting?
2. **Price Sensitivity**: Are associations price-sensitive (non-profit budgets)?
3. **Value Metric**: Should pricing be per member, per email, per association, or flat rate?
4. **Competitor Benchmarking**: What do Mailchimp, SendGrid, Wild Apricot charge?
5. **Free Tier Limits**: What limits drive conversion without hurting adoption?
6. **Annual vs Monthly**: Should we offer annual discounts (e.g., $15/mo if paid yearly)?

**Validation Methods**:
- User interviews with 20+ associations (current pain points, budget)
- Van Westendorp Price Sensitivity Meter (survey)
- Competitor feature/price matrix
- Beta launch with 3 price points (A/B test)
- Cost analysis (infrastructure, support, CAC, LTV)

**Pricing Hypotheses to Test**:
- H1: European associations will pay €5-15/month for managed hosting (validated insight)
- H2: Free tier with 50 members drives conversions to Starter (€5)
- H3: Three paid tiers (€5/€10/€15) capture different association sizes
- H4: Annual plans with 20% discount (€4/€8/€12 per month) increase LTV
- H5: Impact tier (free for social projects) builds brand goodwill and PR

**Pricing Rationale** (European Market):
- €5/month = Coffee budget, impulse purchase, minimal friction
- €10/month = Sweet spot for small-medium associations (200-500 members)
- €15/month = Premium tier for larger associations wanting white-label
- Impact tier = Free for impactful projects (schools in disadvantaged areas, refugee support, etc.)
