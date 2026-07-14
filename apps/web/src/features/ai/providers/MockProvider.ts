import { ChatMessage, AIProviderConfig } from '@ai-video-editor/shared';
import { BaseAIProvider } from './BaseProvider';

export class MockProvider extends BaseAIProvider {
  async chat(messages: ChatMessage[], config: AIProviderConfig): Promise<ChatMessage> {
    return {
      id: 'mock-' + Date.now(),
      role: 'assistant',
      content: 'I am a mock AI assistant. How can I help you edit your video?',
      timestamp: new Date().toISOString()
    };
  }

  async stream(messages: ChatMessage[], config: AIProviderConfig, onToken: (token: string) => void): Promise<void> {
    const response = "Mock streaming: Let's create a cinematic masterpiece together!";
    for (const word of response.split(' ')) {
      onToken(word + ' ');
      await new Promise(r => setTimeout(r, 50));
    }
  }
}
