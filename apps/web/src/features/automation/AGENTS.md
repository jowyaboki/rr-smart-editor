# Automation Engine Implementation Details

The automation engine implements a multi-stage workflow for batch video generation.

## Core Components

- **BatchEngine**: The primary orchestrator. It handles data fetching, item chunking (concurrency), and lifecycle management.
- **AutomationQueue**: A singleton that manages the order of batch jobs.
- **VariableResolver**: A utility for mapping raw data rows to typed project variables.
- **BatchValidationService**: Ensures data integrity and asset availability before rendering.

## Workflow Detail

1. **Fetch**: Loads data from JSON/CSV/API.
2. **Chunk**: Items are processed in groups defined by `profile.concurrency`.
3. **Resolve**: `VariableResolver` applies mappings.
4. **Validate**: `BatchValidationService` checks for missing data or broken links.
5. **Simulate**: Currently, project generation and render triggering are simulated for architectural validation.

## Adding Data Sources

To add a new data source:
1. Update `DataSourceType` in `packages/shared/src/automation/types.ts`.
2. Implement the fetching logic in `AutomationService.fetchData`.

## Concurrency Note

Concurrency is handled using chunked `Promise.all` to avoid overwhelming the browser or the rendering backend.
