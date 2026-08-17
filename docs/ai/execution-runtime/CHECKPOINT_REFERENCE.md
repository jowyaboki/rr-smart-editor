# Checkpoint & Persistence Reference

## Architecture
The runtime utilizes a two-level persistence strategy:
1. **Primary Client Persistence**: IndexedDB (`IndexedDBCheckpointStore`) for offline, browser-native persistence of structured execution snapshots.
2. **Fallback Persistence**: In-memory store (`MemoryCheckpointStore`) for lightweight non-browser test runners.
3. **Server Adapter**: Abstract `ICheckpointStore` interface allowing cloud persistence synchronization without database schema alterations.

## Snapshot Structure
```typescript
export interface CheckpointSnapshot {
  checkpointId: string;
  executionId: string;
  timestamp: string;
  stageName: string;
  graphState: Record<string, { status: NodeExecutionStatus; attempts: number; error?: string }>;
  contextData: Record<string, any>;
  artifacts: ArtifactReference[];
  approvals: ApprovalGate[];
}
```
