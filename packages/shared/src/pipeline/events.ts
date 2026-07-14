export type PipelineEventType =
  | 'ProjectOpened'
  | 'AssetImported'
  | 'TimelineUpdated'
  | 'AnimationChanged'
  | 'TemplateApplied'
  | 'RenderStarted'
  | 'RenderCompleted';

export interface PipelineEvent {
  type: PipelineEventType;
  payload: any;
  timestamp: string;
  userId?: string;
  projectId?: string;
}
