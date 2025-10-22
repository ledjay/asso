# @repo/auth

Authentication configuration for AssociationHub using NextAuth.js v5.

## Overview

This package provides:
- **NextAuth.js v5** configuration
- **Credentials provider** - Email/password authentication
- **Prisma adapter** - Database session storage
- **React hooks** - useSession, signIn, signOut

## Usage

```typescript
import { auth, signIn, signOut } from '@repo/auth/config';
import { useSession } from '@repo/auth/hooks';

// Server-side (Server Components, API routes)
const session = await auth();

// Client-side (Client Components)
function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Welcome {session.user.name}</div>;
}
```

## Configuration

Requires environment variables:

```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate secret:
```bash
openssl rand -base64 32
```

## MVP Implementation

- ✅ Email/password authentication (Credentials provider)
- ✅ Single admin user per deployment (single-tenant)
- ✅ Session management with JWT
- ✅ Password hashing with bcrypt

## Post-MVP Enhancements

- OAuth providers (Google, GitHub)
- Multi-tenant support
- Role-based access control
- Two-factor authentication
- Password reset flow
