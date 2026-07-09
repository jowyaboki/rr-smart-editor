import { BatchItem, GenerationProfile } from '@ai-video-editor/shared';

export const RetryService = {
  shouldRetry(item: BatchItem, profile: GenerationProfile, currentRetries: number): boolean {
    return (
      item.status === 'failed' &&
      currentRetries < profile.retryConfig.maxRetries
    );
  },

  getBackoffMs(profile: GenerationProfile, currentRetries: number): number {
    return profile.retryConfig.backoffMs * Math.pow(2, currentRetries);
  }
};
