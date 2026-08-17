import { ExecutionContextSnapshot, RuntimeEvent } from './types';

export interface PerformanceMetricsReport {
  executionId: string;
  totalDurationMs: number;
  nodeCount: number;
  completedNodes: number;
  failedNodes: number;
  retriesCount: number;
  checkpointEfficiencyScore: number;
  averageNodeLatencyMs: number;
  schedulerLatencyMs: number;
  humanInterventionFrequency: number;
  aiProductivityScore: number;
}

export class ExecutionAnalytics {
  static analyzeExecution(
    context: ExecutionContextSnapshot,
    events: RuntimeEvent[]
  ): PerformanceMetricsReport {
    const totalDurationMs = context.metrics.totalDurationMs || (Date.now() - context.metrics.startTime);
    const nodeDurations = Object.values(context.metrics.nodeDurationsMs);
    const averageNodeLatencyMs = nodeDurations.length > 0
      ? nodeDurations.reduce((a, b) => a + b, 0) / nodeDurations.length
      : 0;

    let retriesCount = 0;
    for (const count of Object.values(context.metrics.retryCounts)) {
      retriesCount += count;
    }

    const checkpointEvents = events.filter(e => e.type === 'checkpoint.created');
    const checkpointEfficiencyScore = checkpointEvents.length > 0 ? Math.min(100, Math.round(10000 / (checkpointEvents.length * 10 + 1))) : 100;

    const approvalEvents = events.filter(e => e.type === 'approval.requested');
    const humanInterventionFrequency = approvalEvents.length;

    const completedNodesCount = events.filter(e => e.type === 'node.completed').length;
    const failedNodesCount = events.filter(e => e.type === 'node.failed').length;

    const totalExecuted = completedNodesCount + failedNodesCount;
    const aiProductivityScore = totalExecuted > 0 ? Math.round((completedNodesCount / totalExecuted) * 100) : 100;

    return {
      executionId: context.executionId,
      totalDurationMs,
      nodeCount: Object.keys(context.metrics.nodeDurationsMs).length,
      completedNodes: completedNodesCount,
      failedNodes: failedNodesCount,
      retriesCount,
      checkpointEfficiencyScore,
      averageNodeLatencyMs,
      schedulerLatencyMs: context.metrics.schedulerLatencyMs || 0,
      humanInterventionFrequency,
      aiProductivityScore
    };
  }
}
