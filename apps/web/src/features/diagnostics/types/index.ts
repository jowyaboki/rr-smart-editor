export * from '@ai-video-editor/observability';

export interface DeveloperAlert {
  id: string;
  timestamp: number;
  severity: 'warning' | 'critical';
  engine: string;
  message: string;
}
