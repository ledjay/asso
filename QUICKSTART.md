# 🚀 Quick Start Guide

Get AssociationHub running locally in **5 minutes**!

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** ([Download](https://www.docker.com/products/docker-desktop))

## One-Command Setup

```bash
pnpm setup
```

This will:
1. ✅ Install all dependencies
2. ✅ Copy environment variables
3. ✅ Start PostgreSQL with Docker
4. ✅ Run database migrations
5. ✅ Seed with sample data

## Manual Setup (If Needed)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy example env file
cp .env.example .env
cp .env.example packages/database/.env

# Edit .env if needed (default values work for local development)
```

### 3. Start PostgreSQL

```bash
# Start database
pnpm db:start

# Check it's running
docker ps
```

### 4. Set Up Database

```bash
# Generate Prisma Client
pnpm --filter database prisma:generate

# Run migrations
pnpm --filter database prisma:migrate

# Seed with sample data (Parents template by default)
pnpm --filter database prisma:seed

# Or seed with Sports template
SEED_TEMPLATE=sports pnpm --filter database prisma:seed

# Or seed with Cultural template
SEED_TEMPLATE=cultural pnpm --filter database prisma:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** 🎉

## Useful Commands

### Development

```bash
# Start Next.js dev server
pnpm dev

# Start Storybook (component library)
pnpm storybook

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Run tests
pnpm test
```

### Database

```bash
# Start database
pnpm db:start

# Stop database
pnpm db:stop

# Reset database (delete all data)
pnpm db:reset

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database with different templates
SEED_TEMPLATE=parents pnpm --filter database prisma:seed
SEED_TEMPLATE=sports pnpm --filter database prisma:seed
SEED_TEMPLATE=cultural pnpm --filter database prisma:seed
```

### Prisma

```bash
# Generate Prisma Client (after schema changes)
pnpm --filter database prisma:generate

# Create a new migration
pnpm --filter database prisma:migrate

# View database in browser
pnpm --filter database prisma:studio
```

## Default Credentials

After seeding, you can log in with:

- **Email**: `admin@example.com`
- **Password**: `password123`

## Project Structure

```
association-hub/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── ui/              # Component library (shadcn/ui)
│   ├── database/        # Prisma + database logic
│   ├── email/           # Email sending (Nodemailer)
│   ├── auth/            # Authentication (NextAuth)
│   └── types/           # Shared TypeScript types
├── docker-compose.yml   # PostgreSQL setup
└── .env.example         # Environment variables template
```

## Troubleshooting

### Port 5432 Already in Use

```bash
# Stop existing PostgreSQL
brew services stop postgresql

# Or use different port in docker-compose.yml
ports:
  - "5433:5432"  # Change to 5433

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/associationhub"
```

### Database Connection Error

```bash
# Check Docker is running
docker ps

# Restart database
pnpm db:stop
pnpm db:start

# Wait a few seconds and try again
```

### Prisma Client Not Generated

```bash
# Generate Prisma Client
pnpm --filter database prisma:generate

# Run typecheck again
pnpm typecheck
```

### Clean Start

```bash
# Remove everything and start fresh
pnpm db:reset
rm -rf node_modules
pnpm install
pnpm db:setup
```

## Next Steps

- 📖 Read the [full documentation](./docs/en/getting-started.md)
- 🎨 Explore [Storybook](http://localhost:6006) - `pnpm storybook`
- 🗄️ View [database](http://localhost:5555) - `pnpm db:studio`
- 🤝 Read [contributing guide](./CONTRIBUTING.md)

## Need Help?

- 💬 [GitHub Discussions](https://github.com/associationhub/associationhub/discussions)
- 🐛 [Report a Bug](https://github.com/associationhub/associationhub/issues)
- 📧 [Email Support](mailto:support@associationhub.org)

Happy coding! 🚀
