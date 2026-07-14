# Developer Setup & Installation Guide

Follow these instructions to quickly get your development environment configured and running for the RR Smart Editor workspace.

## 1. Prerequisites
Ensure you have the following packages installed locally:
- **Node.js:** `v18` or newer.
- **Git**

## 2. Quickstart Setup
Run the following commands in order to set up dependencies and build local workspace symlinks:

```bash
# Clone the repository
git clone https://github.com/myn/ai-video-editor.git
cd ai-video-editor

# Install monorepo dependencies
npm install

# Run a first monorepo development compilation
npm run build
```

## 3. Command Scripts
The root `package.json` contains several workspace-wide orchestration scripts:

- `npm run dev`: starts both the server and web application in concurrent watch mode.
- `npm run build`: compiles all workspaces and outputs static web build artifacts.
- `npm run lint`: runs ESLint style checks across all packages.
- `npm run format`: formats all typescript, markdown, and configuration files with Prettier.

## 4. Testing
We use Node.js's native test runner to test services with high performance. Run the unit test suites with:

```bash
npx tsx --test apps/web/src/features/recovery/__tests__/recovery.test.ts apps/web/src/features/performance/__tests__/performance.test.ts
```
