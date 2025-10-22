# AssociationHub

> 📖 [Version française](./README.fr.md)

**Open-source member management and email communication platform for associations**

[![CI](https://github.com/associationhub/associationhub/workflows/CI/badge.svg)](https://github.com/associationhub/associationhub/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

## ✨ Features

- 👥 **Member Management** - Import, export, and manage association members
- 📧 **Email Communication** - Send personalized emails with template tags
- 🎯 **Smart Filtering** - Target specific roles and groups
- 📎 **Attachments** - Send PDF files with your emails
- 🎨 **Templates** - Pre-configured for Parents, Sports, and Cultural associations
- 🌍 **i18n Ready** - French by default, English and more languages coming
- 🐳 **Docker Ready** - One-command setup with Docker Compose
- 🚀 **Self-Hostable** - Deploy on Vercel, Railway, Docker, or any Node.js host

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local database)

### Installation

```bash
# Clone the repository
git clone https://github.com/associationhub/associationhub.git
cd associationhub

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate secrets (add to .env)
openssl rand -base64 32  # NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # ENCRYPTION_KEY

# Start PostgreSQL
docker compose up -d

# Run migrations
cd packages/database && npx prisma migrate dev && cd ../..

# Start development server
pnpm dev
```

Visit **http://localhost:3000** 🎉

**Default login**: `admin@example.com` / `password123`

📖 See [SETUP.md](./SETUP.md) for complete setup instructions including SMTP configuration.

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions with SMTP configuration
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines
- [Full Documentation](./docs/en/) - Complete guides

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **Email**: Nodemailer
- **Monorepo**: pnpm workspaces
- **Deployment**: Vercel, Railway, Docker

## 📦 Project Structure

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/associationhub.git

# Create a branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌟 Deployment Options

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/associationhub/associationhub)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/associationhub)

### Docker

```bash
docker compose up -d
```

See [deployment guides](./docs/en/) for more options.

## 💬 Community & Support

- 💬 [GitHub Discussions](https://github.com/associationhub/associationhub/discussions)
- 🐛 [Report a Bug](https://github.com/associationhub/associationhub/issues)
- 📧 [Email Support](mailto:support@associationhub.org)

## 🗺️ Roadmap

- [x] MVP - Member management & email sending
- [ ] Multi-tenant SaaS version
- [ ] Template marketplace
- [ ] Mobile app
- [ ] Advanced analytics

## ⭐ Star History

If you find this project useful, please consider giving it a star!

## 🙏 Acknowledgments

Built with ❤️ for associations worldwide.

---

**AssociationHub** - Making association management delightful
