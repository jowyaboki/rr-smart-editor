# System Architecture

This document maps the complete architecture of the RR Smart Editor Studio Platform (v3.0).

## 1. Unified Dependency Graph

The platform is designed around a strictly decoupled, highly modular monorepo structure:

```
                  [ Studio Platform Engine ]
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
[ Platform Kernel ]    [ Cloud Platform ]      [ AI Runtime ]
     │                        │                        │
     ▼                        ▼                        ▼
[ Marketplace ]         [ Delivery Engine ]     [ Public SDK ]
```

### Module Boundaries
- **Core Editor Core**: Completely isolated.
- **Platform Modules**: Communicate via the centralized `PlatformEventSystem`. Circular dependencies are strictly forbidden and verified via static analysis.

## 2. Package Ownership Matrix

- `@ai-video-editor/platform-kernel`: Framework lifecycle and dependency resolution.
- `@ai-video-editor/package-manager`: Extensibility and Marketplace.
- `@ai-video-editor/public-sdk`: API client bindings.
- `@ai-video-editor/ai-copilot`: Intent processing and RAG.

## 3. Architectural Decision Records (ADRs)

### ADR-001: Standalone Offline Database Fallback
- **Context**: Standard enterprise environments occasionally suffer network loss or require isolated installations.
- **Decision**: DB operations fallback to a table-based local in-memory router with transaction logging.
- **Status**: Accepted.

### ADR-002: Dynamic Hot-Swappable Extensions
- **Context**: Plugins must be installable on-the-fly without requiring editor restarts.
- **Decision**: In-memory class instantiation under sandboxed boundaries.
- **Status**: Accepted.
