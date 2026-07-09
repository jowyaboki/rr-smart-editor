# Production Pipeline Implementation Details

The production pipeline integrates all editor subsystems into a coherent workflow.

## Core Services

- **WorkflowEngine**: Orchestrates transitions between project stages (media, timeline, validation, etc.).
- **ValidationEngine**: Performs pre-render checks. It is the source of truth for the `ExportChecklist`.
- **HealthService**: Calculates the Project Readiness Score and identifies optimization opportunities.
- **EventPipeline**: A central hub for cross-feature communication. Emits events like `TimelineUpdated` or `RenderStarted`.

## Integration Points

- **Stores**: Media, Timeline, and Rendering stores are hooked into the `EventPipeline` to trigger analytics and health checks.
- **UI**:
    - **HealthPanel**: Provides a dedicated view for project quality and quick fixes.
    - **ExportDialog**: Intercepts the export process to force a final validation pass.

## Analytics & Tracking

Editing time and asset usage are tracked through the `AnalyticsService` and stored in the `pipelineStore`. This data is intended for user reporting and project optimization.
