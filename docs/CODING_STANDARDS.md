# Coding Standards

## General
- Use TypeScript for all code.
- No `// @ts-ignore` allowed.
- Follow Prettier and ESLint configurations.

## Frontend
- Use React Query for all API interactions.
- Manage global state with Zustand.
- Use absolute imports (e.g., `@/components/...`).
- UI components should be based on Material UI.

## Backend
- Use a service-provider pattern for complex logic (e.g., AI, Rendering).
- Validate all incoming requests with Zod.
- Use parameterized SQL queries to prevent injection.
- Implement proper logging using the central logger utility.

## State Management
- Keep state serializable whenever possible.
- Use `zundo` for undo/redo in the timeline.
