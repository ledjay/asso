# AssociationHub Setup Guide

Complete setup instructions for running AssociationHub locally or in production.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** (for local PostgreSQL database)
- **Git**

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/associationhub/associationhub.git
cd associationhub
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Database (Docker will create this automatically)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/associationhub"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Encryption Key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# CRITICAL: This encrypts SMTP passwords in the database
# Must be 64 hex characters (32 bytes)
ENCRYPTION_KEY="your-64-character-hex-key-here"
```

**Generate secrets:**
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate encryption key (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start PostgreSQL Database

```bash
docker compose up -d
```

This starts a PostgreSQL database on `localhost:5432`.

### 5. Run Database Migrations

```bash
cd packages/database
npx prisma migrate dev
cd ../..
```

### 6. Seed the Database

Create an admin user:

```bash
cd packages/database
npx prisma db seed
cd ../..
```

**Default admin credentials:**
- Email: `admin@example.com`
- Password: `password123`

⚠️ **Change these credentials immediately after first login!**

### 7. Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** 🎉

---

## First-Time Setup Flow

### 1. Login

- Navigate to http://localhost:3000
- Login with `admin@example.com` / `password123`

### 2. Select Association Template

Choose one of three templates:
- **Parents d'élèves** - For school parent associations
- **Sports Club** - For sports teams and clubs
- **Cultural Association** - For cultural organizations

This seeds your database with appropriate roles and groups.

### 3. Configure SMTP (Email Sending)

Navigate to **Settings** (`/dashboard/settings`) and configure your email provider:

#### Gmail Setup (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. In AssociationHub Settings:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: The App Password (16 characters)
   - **From Address**: Your Gmail address

#### Outlook/Hotmail Setup

- **Host**: `smtp-mail.outlook.com`
- **Port**: `587`
- **Username**: Your Outlook email
- **Password**: Your Outlook password
- **From Address**: Your Outlook email

#### Custom SMTP Provider

- **Host**: Your SMTP server hostname
- **Port**: Usually `587` (TLS) or `465` (SSL)
- **Username**: Your SMTP username
- **Password**: Your SMTP password
- **From Address**: Sender email address

**Test your configuration** using the "Test Configuration" button.

### 4. Import Members

1. Navigate to **Members** (`/dashboard/members`)
2. Click **"Import Members"**
3. Download the example CSV template
4. Fill in your member data:
   ```csv
   nom,email,role,groupe
   Jean Dupont,jean@example.com,delegue_titulaire,6e1
   Marie Martin,marie@example.com,membre,5e2
   ```
5. Upload your CSV file
6. Review import results

### 5. Send Your First Email

1. Navigate to **Compose Email** (`/dashboard/emails/compose`)
2. Write your subject and message
3. Use template tags for personalization:
   - `{Nom}` - Member's name
   - `{Role}` - Member's role
   - `{Groupe}` - Member's group
4. Filter recipients by role and/or group
5. Click **"Send Email"**

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Database encryption key (64 hex chars) | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Not required for local dev |

### Security Notes

⚠️ **CRITICAL**: Never commit `.env` to version control!

- `NEXTAUTH_SECRET` - Encrypts session tokens
- `ENCRYPTION_KEY` - Encrypts SMTP passwords in database
- Both must be kept secret and unique per deployment

---

## Database Management

### View Database

```bash
cd packages/database
npx prisma studio
```

Opens Prisma Studio at http://localhost:5555

### Reset Database

⚠️ **This deletes all data!**

```bash
cd packages/database
npx prisma migrate reset
```

### Create New Migration

```bash
cd packages/database
npx prisma migrate dev --name your_migration_name
```

---

## Troubleshooting

### Database Connection Errors

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker compose down
docker compose up -d
```

### SMTP Configuration Errors

**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solutions**:
- **Gmail**: Use an App Password, not your regular password
- **Outlook**: Ensure 2FA is disabled or use app-specific password
- **Custom SMTP**: Verify credentials with your provider

**Error**: `Connection timeout`

**Solutions**:
- Check firewall settings
- Verify SMTP host and port
- Try port 465 (SSL) instead of 587 (TLS)

### Encryption Errors

**Error**: `ENCRYPTION_KEY is not defined`

**Solution**:
```bash
# Generate a new encryption key (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo 'ENCRYPTION_KEY="your-generated-key"' >> .env
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

---

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `DATABASE_URL` - Use Vercel Postgres
   - `NEXTAUTH_URL` - Your domain (e.g., `https://yourapp.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate new secret
   - `ENCRYPTION_KEY` - Generate new key
4. Deploy!

**Vercel Postgres Setup**:
- Create a Postgres database in Vercel
- Copy the `DATABASE_URL` to environment variables
- Run migrations: `npx prisma migrate deploy`

### Railway

1. Create new project in Railway
2. Add PostgreSQL database
3. Add environment variables
4. Connect GitHub repository
5. Deploy!

### Docker Production

```bash
# Build production image
docker build -t associationhub .

# Run with docker-compose
docker compose -f docker-compose.prod.yml up -d
```

---

## Development Tips

### Hot Reload

The dev server supports hot reload for:
- React components
- API routes
- Tailwind CSS

### Database Changes

After modifying `schema.prisma`:
```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### Type Safety

Prisma Client is auto-generated. After schema changes:
```bash
cd packages/database
npx prisma generate
```

### Linting & Formatting

```bash
# Lint
pnpm lint

# Format
pnpm format
```

---

## Security Best Practices

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Use strong `ENCRYPTION_KEY` (32+ characters)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Restrict database access (firewall rules)
- [ ] Regular backups of PostgreSQL database
- [ ] Monitor error logs
- [ ] Keep dependencies updated

### SMTP Security

- ✅ **DO**: Use App Passwords (Gmail)
- ✅ **DO**: Store credentials encrypted in database
- ✅ **DO**: Use TLS/SSL (ports 587/465)
- ❌ **DON'T**: Use your main email password
- ❌ **DON'T**: Commit SMTP credentials to Git
- ❌ **DON'T**: Share your encryption key

---

## Getting Help

- 📖 [Full Documentation](./docs/en/)
- 💬 [GitHub Discussions](https://github.com/associationhub/associationhub/discussions)
- 🐛 [Report Issues](https://github.com/associationhub/associationhub/issues)
- 📧 [Email Support](mailto:support@associationhub.org)

---

**Next Steps**: Check out the [User Guide](./docs/en/user-guide.md) for detailed feature documentation.
