import { ChatMessage, AIProviderConfig, AIProvider } from '@ai-video-editor/shared';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { MockProvider } from '../providers/MockProvider';

export class AIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('mock', new MockProvider());
  }

  async chat(messages: ChatMessage[], config: AIProviderConfig): Promise<ChatMessage> {
    const provider = this.getProvider(config.provider);
    try {
      return await provider.chat(messages, config);
    } catch (err) {
      console.error(`AI Provider ${config.provider} failed, falling back to mock`, err);
      return await this.getProvider('mock').chat(messages, config);
    }
  }

  async stream(messages: ChatMessage[], config: AIProviderConfig, onToken: (token: string) => void): Promise<void> {
    const provider = this.getProvider(config.provider);
    return provider.stream(messages, config, onToken);
  }

  private getProvider(name: string): AIProvider {
    return this.providers.get(name) || this.providers.get('mock')!;
  }
}

export const aiOrchestrator = new AIOrchestrator();
