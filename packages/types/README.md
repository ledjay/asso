# @repo/types

Shared TypeScript types for AssociationHub.

## Overview

This package contains type definitions shared across all packages and apps:
- **Common types** - Pagination, API responses, errors
- **Member types** - Member, Role, GroupType
- **Email types** - EmailCampaign, EmailComposerData
- **Template types** - TemplateType, TemplateSelection

## Usage

```typescript
import type { Member, MemberFilters } from '@repo/types/member';
import type { EmailCampaign } from '@repo/types/email';
import type { PaginationResult } from '@repo/types/common';

// Use types for type-safe development
const members: PaginationResult<Member> = await fetchMembers({
  roleId: 'role-123',
  search: 'Jean'
});
```

## Type Categories

### Common Types
- `PaginationParams` - Pagination parameters
- `PaginationResult<T>` - Paginated response
- `ApiError` - Error response
- `ApiSuccess<T>` - Success response

### Member Types
- `Member` - Member entity
- `Role` - Role entity
- `GroupType` - Group entity
- `MemberInput` - Member creation/update
- `MemberFilters` - Member filtering

### Email Types
- `EmailCampaign` - Email campaign entity
- `EmailComposerData` - Email composition data
- `EmailSendResult` - Email send response

### Template Types
- `TemplateType` - Template selection ("parents" | "sports" | "cultural")
- `TemplateSelection` - Template selection payload
- `TemplateData` - Template role/group data

## Benefits

✅ **Type Safety** - Catch errors at compile time  
✅ **IntelliSense** - Auto-completion in IDE  
✅ **Documentation** - Types serve as documentation  
✅ **Refactoring** - Safe refactoring across packages  
✅ **Consistency** - Shared types ensure consistency
