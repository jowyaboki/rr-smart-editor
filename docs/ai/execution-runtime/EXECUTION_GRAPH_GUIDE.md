# Execution Graph & DAG Guide

## Concept
Every AI workflow is represented as an `ExecutionGraph` containing strongly-typed `ExecutionNode`s.

```typescript
export interface ExecutionGraph {
  graphId: string;
  name: string;
  version: string;
  nodes: Record<string, ExecutionNode>;
}
```

## Supported Graph Operations
- **Parallel Branch Execution**: Nodes with satisfied dependencies execute concurrently up to the configured scheduler concurrency limit.
- **Human Approval Gates**: Intercepts node dispatch and pauses execution until explicit approval/rejection is provided.
- **Conditional Branching**: Evaluates runtime context variables to determine dynamic execution paths.
- **Fallback Paths**: Reroutes execution to alternative recovery nodes upon unrecoverable failure.
- **Optional Stages**: Non-critical nodes marked with `isOptional: true` are safely skipped on failure.
