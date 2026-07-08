import { AIServiceProvider } from './types';
import { OpenAIProvider } from './openai';
import { MockAIProvider } from './mock';

export class AIProviderRegistry {
  private providers: Map<string, AIServiceProvider> = new Map();

  constructor() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('mock', new MockAIProvider());
    // Future providers can be registered here
    // this.providers.set('claude', new ClaudeProvider());
  }

  getProvider(name: string): AIServiceProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI Provider ${name} not found`);
    }
    return provider;
  }
}

export const aiRegistry = new AIProviderRegistry();
