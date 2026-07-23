export * from '@ai-video-editor/ai-copilot';

export interface WebCopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
