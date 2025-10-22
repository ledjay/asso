# Contributing to AssociationHub

> 📖 [Version française](./CONTRIBUTING.fr.md)

Thank you for your interest in contributing to AssociationHub! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Fix issues
- ✨ Add new features
- 🌍 Translate to new languages
- 🎨 Improve UI/UX

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/associationhub.git
cd associationhub
```

### 2. Set Up Development Environment

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:setup

# Start development server
pnpm dev
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Development Workflow

### Code Style

We use **Biome** for linting and formatting:

```bash
# Lint code
pnpm lint

# Format code
pnpm --filter web format

# Type check
pnpm typecheck
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add member export feature
fix: resolve email sending bug
docs: update README
style: format code
refactor: simplify member import logic
test: add tests for email templates
chore: update dependencies
```

### Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Database Changes

```bash
# Create a migration
pnpm --filter database prisma:migrate

# Generate Prisma Client
pnpm --filter database prisma:generate

# View database
pnpm db:studio
```

## 🎯 Pull Request Process

### 1. Before Submitting

- ✅ Code follows project style guidelines
- ✅ All tests pass (`pnpm test`)
- ✅ Type checking passes (`pnpm typecheck`)
- ✅ Linting passes (`pnpm lint`)
- ✅ Documentation updated (if needed)
- ✅ Commit messages follow conventions

### 2. Submit Pull Request

1. Push your changes to your fork
2. Open a Pull Request on GitHub
3. Fill out the PR template
4. Link related issues
5. Wait for review

### 3. PR Review

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## 📚 Project Structure

```
association-hub/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App Router pages
│       ├── locales/      # i18n translations
│       └── tests/        # E2E tests
├── packages/
│   ├── ui/              # Component library
│   ├── database/        # Prisma + DB logic
│   ├── email/           # Email sending
│   ├── auth/            # Authentication
│   └── types/           # Shared types
└── docs/                # Documentation
```

## 🎨 UI Components

We use **shadcn/ui** for components:

```bash
# Add a new component
cd packages/ui
npx shadcn-ui@latest add button

# View components in Storybook
pnpm storybook
```

## 🌍 Translations

### Adding a New Language

1. Create `apps/web/locales/[lang].json`
2. Copy structure from `fr.json` or `en.json`
3. Translate all strings
4. Update `apps/web/i18n.ts` to support the new language

### Updating Translations

- Edit `apps/web/locales/fr.json` (French)
- Edit `apps/web/locales/en.json` (English)
- Keep keys consistent across languages

## 🐛 Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Try to reproduce on the latest version
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Ubuntu]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

## 📖 Documentation

### Improving Documentation

- Documentation is in `/docs/`
- English first (`/docs/en/`), then French (`/docs/fr/`)
- Use clear, simple language
- Include code examples
- Add screenshots when helpful

## ⚖️ Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🙋 Getting Help

- 💬 [GitHub Discussions](https://github.com/associationhub/associationhub/discussions)
- 📧 [Email](mailto:support@associationhub.org)
- 🐛 [Issues](https://github.com/associationhub/associationhub/issues)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🎉 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Part of our community

Thank you for contributing to AssociationHub! 🙏
