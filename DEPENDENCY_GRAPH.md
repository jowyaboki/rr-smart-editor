# Dependency Graph - Phase 10

Visual dependency schema of the Smart Editor workspace modules.

```
       [ apps/web ] (React Client)
            │
            ├─► [ packages/ui ] (Reusable Component Catalog)
            │         │
            │         ▼
            ├─► [ packages/design-system ] (Themes & Tokens)
            │
            ▼
    [ apps/server ] (Offline-compatible SQL router)
```
