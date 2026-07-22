export * from '@ai-video-editor/workflow-designer';

export interface WebWorkflowNode {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
}
