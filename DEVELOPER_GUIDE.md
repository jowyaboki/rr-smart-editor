# Developer Guide - Phase 10

Developer onboarding reference for the RR Smart Editor workspaces.

## 1. Commands & Scripts
* `npm install`: Install monorepo dependencies.
* `npm run build`: Build all workspaces and app modules.
* `npm run lint`: Lint and format.

## 2. Component Scaffolding
* All presentation components must be added directly to `packages/ui/src/components/Shared.tsx` and exported via the index to maintain a single visual source of truth.
