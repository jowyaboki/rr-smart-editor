import { ChatMessage, AIProviderConfig, AIProvider } from '@ai-video-editor/shared';

export abstract class BaseAIProvider implements AIProvider {
  abstract chat(messages: ChatMessage[], config: AIProviderConfig): Promise<ChatMessage>;
  abstract stream(messages: ChatMessage[], config: AIProviderConfig, onToken: (token: string) => void): Promise<void>;

  async generateImage(prompt: string, config: AIProviderConfig): Promise<string> {
    return 'https://via.placeholder.com/1024x1024?text=AI+Generated+Image';
  }

  async health(): Promise<boolean> {
    return true;
  }
}
