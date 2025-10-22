# @repo/email

Email sending and template functionality for AssociationHub.

## Overview

This package handles:
- **Email sending** - Nodemailer SMTP integration
- **Template tags** - Replace {Nom}, {Role}, {Group} with member data
- **Attachments** - PDF file support

## Usage

```typescript
import { sendEmail } from '@repo/email/sender';
import { replaceTemplateTags } from '@repo/email/templates';

// Replace template tags
const body = replaceTemplateTags(
  'Bonjour {Nom}, vous êtes {Role} de la {Group}',
  { Nom: 'Jean Dupont', Role: 'Délégué titulaire', Group: 'CM2' }
);

// Send email
await sendEmail({
  to: ['jean@example.com'],
  subject: 'Réunion importante',
  body,
  attachment: {
    filename: 'document.pdf',
    url: 'https://blob.vercel-storage.com/file.pdf'
  }
});
```

## Configuration

Email sending requires SMTP configuration via environment variables:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Association <noreply@example.com>"
```

## Template Tags

Supported tags:
- `{Nom}` - Member name
- `{Role}` - Member role (display name)
- `{Group}` - Member group name

## MVP Implementation

- ✅ Synchronous email sending (simple for MVP)
- ✅ Single PDF attachment (< 5MB)
- ✅ SMTP configuration from environment variables

## Post-MVP Enhancements

- Async email queue (Bull + Redis)
- Per-recipient tracking
- Bounce handling
- Multiple attachments
- Email templates library
