# RR Smart Editor - Monorepo Consolidation & Architectural Standards

This document establishes the unified, standard architectural conventions that every feature module inside the RR Smart Editor codebase must follow.

---

## 1. Unified Directory Layout

Every system module (located under `apps/web/src/features/`) is organized around a strict domain-driven layered architecture:

```
features/my-feature/
  ├── components/   # Pure React presentation layers (Material UI)
  ├── hooks/        # React bindings connecting UI elements to stores and services
  ├── services/     # Decoupled business logic singletons (zero-dependency TS)
  ├── store/        # Zustand state persistence layers & memoized selector bindings
  ├── types/        # Strong typed definitions
  ├── utils/        # Internal utility algorithms
  └── __tests__/    # Native unit and integration test specs
```

---

## 2. Decoupled Service Layer Pattern

- **Rule:** React components must never contain complex calculations or pure business logic.
- **Rule:** Extract all domain computations into pure, static TypeScript classes under the `services/` folder.
- **Benefit:** Simplifies unit testing, avoids component re-render loops, and promotes clean re-use across the application.

---

## 3. Zustand State Store Conventions

Every Zustand store must separate reads and updates cleanly:

- **Reads:** Always use memoized state selectors to prevent unnecessary render triggers.
- **Updates:** Trigger actions via bound store hooks.
- **Persistence:** Local storage states must be segmented using unique project/session keys to prevent large array overflows.

---

## 4. Standardized Event & Command System

- **Typed EventBus:** All modules must publish and subscribe to a typed `EventBus` to prevent tight coupling.
- **Undo/Redo Command API:** All modifications to project state must go through a command registry that automatically supports reversing operations.

---

## 5. Strong Typing & zero-ignore Boundaries

- **Zero ts-ignores:** No TypeScript ignores (`// @ts-ignore`) are permitted.
- **Zod schemas:** Every domain model exported from `@ai-video-editor/shared` must be accompanied by a matching Zod schema to enforce runtime validation boundaries.
