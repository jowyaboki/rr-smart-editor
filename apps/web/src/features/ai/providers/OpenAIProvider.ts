import { ChatMessage, AIProviderConfig } from '@ai-video-editor/shared';
import { BaseAIProvider } from './BaseProvider';

export class OpenAIProvider extends BaseAIProvider {
  async chat(messages: ChatMessage[], config: AIProviderConfig): Promise<ChatMessage> {
    // Real call to OpenAI API would go here
    return {
      id: Math.random().toString(),
      role: 'assistant',
      content: 'Hello! I am OpenAI.',
      timestamp: new Date().toISOString()
    };
  }

  async stream(messages: ChatMessage[], config: AIProviderConfig, onToken: (token: string) => void): Promise<void> {
    const text = "This is a streamed response from OpenAI...";
    for (const char of text.split('')) {
      onToken(char);
      await new Promise(r => setTimeout(r, 20));
    }
  }
}
