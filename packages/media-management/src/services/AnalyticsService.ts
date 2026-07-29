import { AssetAnalytics } from '../types';

export class AnalyticsService {
  private analytics: Map<string, AssetAnalytics> = new Map();

  public trackDownload(assetId: string): void {
    const record = this.getOrCreateAnalytics(assetId);
    record.downloadsCount += 1;
    record.storageGrowthBytes += 1024 * 10; // logging overhead
  }

  public trackUsageInProject(assetId: string, projectId: string): void {
    const record = this.getOrCreateAnalytics(assetId);
    record.projectUsageCount += 1;

    const exists = record.publishingHistory.some((h) => h.platform === projectId);
    if (!exists) {
      record.publishingHistory.push({
        platform: projectId,
        publishedAt: new Date().toISOString(),
      });
    }
  }

  public recordRenderFrequency(assetId: string): void {
    const record = this.getOrCreateAnalytics(assetId);
    record.renderFrequency += 1;
  }

  public recordAIUsage(assetId: string, tool: string): void {
    const record = this.getOrCreateAnalytics(assetId);
    record.aiUsageLogs.push({
      tool,
      timestamp: new Date().toISOString(),
    });
  }

  public getOrCreateAnalytics(assetId: string): AssetAnalytics {
    let record = this.analytics.get(assetId);
    if (!record) {
      record = {
        assetId,
        downloadsCount: 0,
        projectUsageCount: 0,
        renderFrequency: 0,
        publishingHistory: [],
        aiUsageLogs: [],
        storageGrowthBytes: 0,
      };
      this.analytics.set(assetId, record);
    }
    return record;
  }
}

export const globalAnalyticsService = new AnalyticsService();
