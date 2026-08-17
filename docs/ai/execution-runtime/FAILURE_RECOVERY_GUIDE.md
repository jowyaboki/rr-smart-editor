# Failure Recovery & Resiliency Guide

## Automatic Retries
Configured via `RetryPolicy` on execution nodes:
- `maxRetries`: Maximum retry count before marking as failed.
- `backoffMs`: Base backoff duration in milliseconds.
- `exponential`: Exponential vs linear delay multiplier.

## Checkpoint Rollback
executions can roll back to any historical snapshot:
```typescript
const restoredCtx = await runtime.restoreCheckpoint(context, graph, checkpointId);
```

## Human Repair & Partial Reruns
Failed executions can be inspected in the Live Execution Workspace, manually repaired, or replayed from the point of failure.
