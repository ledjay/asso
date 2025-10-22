# @repo/ui

Shared UI component library for AssociationHub.

## Overview

This package contains reusable React components built with:
- **shadcn/ui** - Copy-paste component architecture
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **class-variance-authority** - Type-safe variant management
- **Storybook** - Component documentation and testing

## Usage

```tsx
import { Button } from '@repo/ui/components/Button';

export default function MyPage() {
  return <Button variant="default">Click me</Button>;
}
```

## Development

```bash
# Run Storybook
pnpm storybook

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Adding Components

Components follow the shadcn/ui pattern:

1. Create component directory: `src/components/ComponentName/`
2. Add component file: `ComponentName.tsx`
3. Add Storybook stories: `ComponentName.stories.tsx`
4. Export from `index.ts`

## Structure

```
src/
├── components/       # UI components
│   ├── Button/
│   ├── Input/
│   └── ...
├── lib/             # Utilities
│   └── utils.ts     # cn() className merger
└── index.ts         # Main exports
```
