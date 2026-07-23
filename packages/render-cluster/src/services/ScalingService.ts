import { ScalingPolicy, ClusterMetrics, Node } from '../types';
import { NodeRegistry } from './NodeRegistry';

export class ScalingService {
  private registry: NodeRegistry;
  private policies: ScalingPolicy[] = [];

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  public registerPolicy(policy: ScalingPolicy): void {
    this.policies.push(policy);
  }

  /**
   * Evaluates active telemetry metrics against registered policies and triggers scale events
   */
  public evaluateScaling(metrics: ClusterMetrics): {
    action: 'scale_up' | 'scale_down' | 'none';
    targetSize: number;
    increment: number;
  } {
    let action: 'scale_up' | 'scale_down' | 'none' = 'none';
    let targetSize = metrics.totalNodes;
    let increment = 0;

    for (const policy of this.policies) {
      // Trigger cooling period check
      if (policy.lastScalingActionAt) {
        const lastActionTime = new Date(policy.lastScalingActionAt).getTime();
        if (Date.now() - lastActionTime < policy.cooldownPeriodSec * 1000) {
          continue; // Policy is in cooldown period
        }
      }

      let valueToEvaluate = 0;
      if (policy.metricType === 'queue_depth') {
        valueToEvaluate = metrics.queueDepth;
      } else if (policy.metricType === 'cpu_utilization') {
        valueToEvaluate = metrics.averageCpuUsage;
      } else if (policy.metricType === 'gpu_utilization') {
        valueToEvaluate = metrics.averageGpuUsage || 0;
      }

      if (valueToEvaluate > policy.upperThreshold) {
        action = 'scale_up';
        increment = policy.scaleUpIncrement;
        targetSize += increment;
        policy.lastScalingActionAt = new Date().toISOString();
        break;
      } else if (valueToEvaluate < policy.lowerThreshold && metrics.totalNodes > 1) {
        action = 'scale_down';
        increment = policy.scaleDownIncrement;
        targetSize = Math.max(1, targetSize - increment);
        policy.lastScalingActionAt = new Date().toISOString();
        break;
      }
    }

    return { action, targetSize, increment };
  }
}
