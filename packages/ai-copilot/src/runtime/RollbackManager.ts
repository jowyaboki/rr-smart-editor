import { ExecutionContextSnapshot, CheckpointSnapshot, ExecutionGraph } from './types';

export class RollbackManager {
  static rollbackToCheckpoint(
    context: ExecutionContextSnapshot,
    graph: ExecutionGraph,
    checkpoint: CheckpointSnapshot
  ): ExecutionContextSnapshot {
    const updatedContext: ExecutionContextSnapshot = {
      ...context,
      currentStage: checkpoint.stageName,
      status: 'running',
      variables: JSON.parse(JSON.stringify(checkpoint.contextData)),
      artifacts: JSON.parse(JSON.stringify(checkpoint.artifacts)),
      approvals: JSON.parse(JSON.stringify(checkpoint.approvals))
    };

    for (const [nodeId, state] of Object.entries(checkpoint.graphState)) {
      if (graph.nodes[nodeId]) {
        graph.nodes[nodeId].status = state.status;
        graph.nodes[nodeId].attempts = state.attempts;
        graph.nodes[nodeId].error = state.error;
      }
    }

    return updatedContext;
  }
}
