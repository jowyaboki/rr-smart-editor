# Design System 5.0 Architecture

Standardized layout primitives and single source of truth dark-themed design tokens under `@ai-video-editor/ui`.

## Core Guidelines
* **Zero Visual Duplication**: Every layout inherits standard `AppShell` and `WorkspaceLayout` primitive components.
* **Pixel-perfect scaling**: Elements map exactly to unified spacing (`xs`, `sm`, `md`, `lg`, `xl`) and standard typography weights.
* **Spring-like Motion**: Transitions leverage cubic-bezier physics variables.
