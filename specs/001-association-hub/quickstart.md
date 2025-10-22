# Quickstart: AssociationHub MVP Development

**Date**: 2025-10-22  
**Purpose**: Get developers up and running quickly

## Prerequisites

- **Node.js**: 20.x LTS or higher
- **pnpm**: 8.x or higher (`npm install -g pnpm`)
- **PostgreSQL**: 15.x or higher (or use Vercel Postgres)
- **Git**: For version control

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/association-hub.git
cd association-hub

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables**:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/associationhub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# SMTP (use Gmail for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Association <noreply@example.com>"

# Vercel Blob (optional for local dev)
BLOB_READ_WRITE_TOKEN="your-token-here"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm --filter database prisma generate

# Run migrations
pnpm --filter database prisma migrate dev

# Seed database (optional - will be done on first login)
pnpm --filter database prisma db seed
```

### 4. Start Development Server

```bash
# Start Next.js dev server
pnpm dev

# Open http://localhost:3000
```

### 5. Start Storybook (Optional)

```bash
# In a separate terminal
pnpm storybook

# Open http://localhost:6006
```

---

## Project Structure

```
association-hub/
├── apps/
│   └── web/                  # Next.js application
│       ├── app/              # App Router pages
│       ├── public/           # Static assets
│       └── tests/            # E2E tests
│
├── packages/
│   ├── ui/                   # Component library
│   ├── database/             # Prisma + DB logic
│   ├── email/                # Email sending
│   ├── auth/                 # NextAuth config
│   └── types/                # Shared types
│
├── docs/                     # Documentation
├── pnpm-workspace.yaml       # pnpm config
└── package.json              # Root package.json
```

---

## Common Commands

### Development

```bash
# Start dev server
pnpm dev

# Start Storybook
pnpm storybook

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Database

```bash
# Generate Prisma client
pnpm --filter database prisma generate

# Create migration
pnpm --filter database prisma migrate dev --name your-migration-name

# Apply migrations
pnpm --filter database prisma migrate deploy

# Seed database
pnpm --filter database prisma db seed

# Open Prisma Studio
pnpm --filter database prisma studio
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web build
pnpm --filter ui build
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit code in relevant package
- Add tests for new functionality
- Update Storybook stories for UI changes
- Update documentation if needed

### 3. Run Checks

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Test
pnpm test

# E2E test
pnpm test:e2e
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Open PR on GitHub
- Ensure CI passes
- Request review
- Merge when approved

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
pnpm --filter email test
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e tests/e2e/email-flow.spec.ts
```

### Component Tests (Storybook)

```bash
# Start Storybook
pnpm storybook

# Run interaction tests
pnpm test-storybook
```

---

## Debugging

### Next.js Debugging

1. Add `debugger` statement in code
2. Run `pnpm dev`
3. Open Chrome DevTools
4. Set breakpoints in Sources tab

### Database Debugging

```bash
# Open Prisma Studio
pnpm --filter database prisma studio

# View database in browser
# http://localhost:5555
```

### Email Debugging

Use [Ethereal Email](https://ethereal.email/) for testing:

```bash
# Get test SMTP credentials
# https://ethereal.email/create

# Update .env with Ethereal credentials
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="your-ethereal-user"
SMTP_PASS="your-ethereal-pass"
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Docker

```bash
# Build image
docker build -t association-hub .

# Run container
docker run -p 3000:3000 --env-file .env association-hub
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Reset database
pnpm --filter database prisma migrate reset
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma client
pnpm --filter database prisma generate

# Restart dev server
pnpm dev
```

### pnpm Install Fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

---

## Resources

- **Documentation**: [/docs/en/](../../../docs/en/)
- **API Reference**: [/specs/001-association-hub/contracts/api.yaml](./contracts/api.yaml)
- **Data Model**: [/specs/001-association-hub/data-model.md](./data-model.md)
- **Research**: [/specs/001-association-hub/research.md](./research.md)
- **Storybook**: http://localhost:6006 (when running)
- **Prisma Studio**: http://localhost:5555 (when running)

---

## Next Steps

1. ✅ Complete quickstart setup
2. 📖 Read [architecture documentation](../../../docs/dev/architecture.md)
3. 🎨 Explore [Storybook components](http://localhost:6006)
4. 🗄️ Review [data model](./data-model.md)
5. 🔌 Check [API contracts](./contracts/api.yaml)
6. 🚀 Start building!

---

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join community for questions
- **Documentation**: Check `/docs/` for guides
- **Code Review**: Ask in pull requests

Happy coding! 🎉
