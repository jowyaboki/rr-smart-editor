export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: any;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'mock';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface AIProvider {
  chat(messages: ChatMessage[], config: AIProviderConfig): Promise<ChatMessage>;
  stream(messages: ChatMessage[], config: AIProviderConfig, onToken: (token: string) => void): Promise<void>;
  generateImage(prompt: string, config: AIProviderConfig): Promise<string>;
  health(): Promise<boolean>;
}
