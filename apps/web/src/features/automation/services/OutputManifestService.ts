import { BatchItem, BatchResult } from '@ai-video-editor/shared';

export const OutputManifestService = {
  generate(batchId: string, items: BatchItem[]): BatchResult {
    const success = items.filter(i => i.status === 'completed').length;
    const failure = items.filter(i => i.status === 'failed').length;

    const renderTimes = items
      .map(i => i.renderTime || 0)
      .filter(t => t > 0);

    const totalTime = items.reduce((acc, i) => acc + (i.duration || 0), 0);
    const avgRenderTime = renderTimes.length > 0
      ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      : 0;

    return {
      batchId,
      items,
      summary: {
        success,
        failure,
        totalTime,
        avgRenderTime
      },
      manifestUrl: `data:application/json;base64,${btoa(JSON.stringify({ batchId, items, summary: { success, failure, totalTime, avgRenderTime } }))}`
    };
  }
};
