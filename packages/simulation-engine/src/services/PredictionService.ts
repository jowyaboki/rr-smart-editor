import { IDigitalTwin, PredictionProvider, Prediction, PerformanceEstimate, CostEstimate } from '../types';

export class PredictionService {
  private providers: PredictionProvider[] = [];

  public registerProvider(provider: PredictionProvider): void {
    this.providers.push(provider);
  }

  public async estimate(twin: IDigitalTwin): Promise<Prediction> {
    const timeline = twin.getProjectState().timeline || { clips: [], tracks: [] };
    const clips = timeline.clips || [];
    const tracks = timeline.tracks || [];
    const workflows = twin.getWorkflows();

    // Default base estimates
    let renderDurationMs = 5000 + clips.length * 500;
    let memoryUsageMb = 256 + tracks.length * 64;
    let cpuUsagePercent = Math.min(100, 10 + clips.length * 3);
    let gpuUsagePercent = Math.min(100, 5 + clips.length * 5);
    let storageGrowthMb = clips.reduce((acc: number, c: any) => acc + (c.sizeMb || 10), 0);
    let networkTransferMb = clips.length * 5;

    // AI token usage calculations
    let aiTokenUsage = 0;
    twin.history.forEach(evt => {
      if (evt.type === 'ai_operation') {
        aiTokenUsage += 1500; // Estimated tokens per AI task
      }
    });

    let aiTokenCost = (aiTokenUsage / 1000) * 0.002; // $0.002 per 1k tokens
    let renderCost = (renderDurationMs / 1000) * 0.0001; // $0.0001 per second
    let storageCost = (storageGrowthMb / 1024) * 0.02; // $0.02 per GB

    // Core predictions combining defaults and registered providers
    for (const provider of this.providers) {
      const custom = await provider.estimate(twin);
      if (custom.performance) {
        if (custom.performance.renderDurationMs !== undefined) renderDurationMs = custom.performance.renderDurationMs;
        if (custom.performance.memoryUsageMb !== undefined) memoryUsageMb = custom.performance.memoryUsageMb;
        if (custom.performance.cpuUsagePercent !== undefined) cpuUsagePercent = custom.performance.cpuUsagePercent;
        if (custom.performance.gpuUsagePercent !== undefined) gpuUsagePercent = custom.performance.gpuUsagePercent;
        if (custom.performance.storageGrowthMb !== undefined) storageGrowthMb = custom.performance.storageGrowthMb;
        if (custom.performance.networkTransferMb !== undefined) networkTransferMb = custom.performance.networkTransferMb;
      }
      if (custom.cost) {
        if (custom.cost.aiTokenCost !== undefined) aiTokenCost = custom.cost.aiTokenCost;
        if (custom.cost.renderCost !== undefined) renderCost = custom.cost.renderCost;
        if (custom.cost.storageCost !== undefined) storageCost = custom.cost.storageCost;
      }
    }

    const totalCost = aiTokenCost + renderCost + storageCost;

    // Evaluate timeline complexity
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (clips.length > 50 || tracks.length > 10) {
      complexity = 'high';
    } else if (clips.length > 15 || tracks.length > 4) {
      complexity = 'medium';
    }

    return {
      id: `pred_${Date.now()}`,
      timestamp: new Date().toISOString(),
      performance: {
        renderDurationMs,
        memoryUsageMb,
        cpuUsagePercent,
        gpuUsagePercent,
        storageGrowthMb,
        networkTransferMb,
      },
      cost: {
        aiTokenCost,
        renderCost,
        storageCost,
        totalCost,
        currency: 'USD',
      },
      timelineComplexity: complexity,
      confidenceScore: 0.9,
    };
  }
}
