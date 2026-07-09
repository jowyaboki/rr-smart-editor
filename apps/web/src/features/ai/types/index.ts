import { ChatMessage, AIProviderConfig, ToolDefinition } from '@ai-video-editor/shared';

export type Message = ChatMessage;
export type AIConfig = AIProviderConfig;

export interface AIState {
  messages: Message[];
  isStreaming: boolean;
  config: AIConfig;
  availableTools: ToolDefinition[];
}
