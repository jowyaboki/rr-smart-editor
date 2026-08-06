# Production Graph Architecture

Unifying every project resource into one interconnected Production Graph.

## Core Services
* **GraphEngine**: Centralized in `packages/project-graph/src/graph/GraphEngine.ts`. Exposes the topological order of dependencies to check for cyclic loops.
* **Selection Context**: clicking a node in the Scene Graph or Asset Dependency view instantly updates the shared selected context.
