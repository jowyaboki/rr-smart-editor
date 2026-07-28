import { Node, ExecutionContext } from '../types';

export interface PerformanceTiming {
  nodeId: string;
  executionTimeMs: number;
  memoryMb: number;
}

export class PreviewService {
  private timingHistory: Map<string, PerformanceTiming[]> = new Map();

  public logExecutionTiming(nodeId: string, executionTimeMs: number, memoryMb: number = 10): void {
    if (!this.timingHistory.has(nodeId)) {
      this.timingHistory.set(nodeId, []);
    }
    this.timingHistory.get(nodeId)!.push({ nodeId, executionTimeMs, memoryMb });
  }

  public getTimingHistory(): Map<string, PerformanceTiming[]> {
    return this.timingHistory;
  }

  /**
   * Generates execution heatmap values where higher average latency corresponds to higher hot ratings
   */
  public generateHeatmap(nodeIds: string[]): Record<string, 'cold' | 'warm' | 'hot'> {
    const heatmap: Record<string, 'cold' | 'warm' | 'hot'> = {};

    nodeIds.forEach((nodeId) => {
      const history = this.timingHistory.get(nodeId) || [];
      if (history.length === 0) {
        heatmap[nodeId] = 'cold';
        return;
      }

      const avgTime = history.reduce((acc, h) => acc + h.executionTimeMs, 0) / history.length;

      if (avgTime > 40) {
        heatmap[nodeId] = 'hot';
      } else if (avgTime > 15) {
        heatmap[nodeId] = 'warm';
      } else {
        heatmap[nodeId] = 'cold';
      }
    });

    return heatmap;
  }

  /**
   * Simulates split video screen preview logic by blending the output of two nodes
   */
  public generateSplitComparison(
    nodeAOutput: any,
    nodeBOutput: any,
    splitRatio: number = 0.5,
  ): string {
    return `[Split-Compare Image: Side A (${splitRatio * 100}% of ${nodeAOutput}) blended with Side B (${(1 - splitRatio) * 100}% of ${nodeBOutput})]`;
  }

  /**
   * Difference view highlight: compares structural variations of output data
   */
  public generateDiffOverlay(nodeAOutput: string, nodeBOutput: string): string {
    return `[Difference Image highlighting absolute mathematical variations between ${nodeAOutput} and ${nodeBOutput}]`;
  }
}
