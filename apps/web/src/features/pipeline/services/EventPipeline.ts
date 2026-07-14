import { PipelineEvent, PipelineEventType } from '@ai-video-editor/shared';
import { AnalyticsService } from './AnalyticsService';
import { HealthService } from './HealthService';
import { usePipelineStore } from '../store/pipelineStore';

type PipelineHandler = (event: PipelineEvent) => void;

class EventPipeline {
  private handlers: Map<PipelineEventType, PipelineHandler[]> = new Map();

  constructor() {
    // Register default system handlers
    this.subscribe('AssetImported', (e) => AnalyticsService.trackAssetUsage(e.payload.assetId));
    this.subscribe('TimelineUpdated', () => this.triggerHealthCheck());
    this.subscribe('AnimationChanged', () => this.triggerHealthCheck());
  }

  subscribe(type: PipelineEventType, handler: PipelineHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  emit(type: PipelineEventType, payload: any) {
    const event: PipelineEvent = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    console.log(`[PipelineEvent] ${type}`, payload);

    const typeHandlers = this.handlers.get(type) || [];
    typeHandlers.forEach(handler => handler(event));
  }

  private async triggerHealthCheck() {
    const health = await HealthService.calculateHealth();
    usePipelineStore.getState().updateHealth(health);
  }
}

export const pipeline = new EventPipeline();
