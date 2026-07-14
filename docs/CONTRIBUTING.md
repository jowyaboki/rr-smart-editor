# Contributing Guidelines

Thank you for contributing to the RR Smart Editor! Follow these core guidelines to ensure high quality, stability, and clean styling across all packages.

## 1. Development Workflow

Always create an isolated topic branch for your modifications:

```bash
git checkout -b feature/my-new-optimization
```

## 2. Style Guides & Format

We enforce rigid style rules across the monorepo:

- **TypeScript Only:** Every file must be strongly-typed. No use of TypeScript ignore comments (`// @ts-ignore`).
- **Formatting:** Run `npm run format` to clean up spacing and imports using Prettier before staging code.
- **Linter:** Run `npm run lint` and resolve all warnings.

## 3. Pull Request Checklist

Before requesting review on your changes, verify that:

1. Both recovery and performance test suites compile and pass successfully (`npx tsx --test ...`).
2. Production bundle packaging compiles with no issues (`npm run build`).
3. Core layout, virtualization layers, and error boundaries perform correctly without runtime errors.
