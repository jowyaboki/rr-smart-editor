import { PipelineAnalytics } from '@ai-video-editor/shared';
import { usePipelineStore } from '../store/pipelineStore';

export const AnalyticsService = {
  trackEditingTime(durationMs: number) {
    const { analytics, updateAnalytics } = usePipelineStore.getState();
    updateAnalytics({ editingTime: analytics.editingTime + durationMs });
  },

  trackAssetUsage(assetId: string) {
    const { analytics, updateAnalytics } = usePipelineStore.getState();
    const usage = { ...analytics.assetUsage };
    usage[assetId] = (usage[assetId] || 0) + 1;
    updateAnalytics({ assetUsage: usage });
  }
};
