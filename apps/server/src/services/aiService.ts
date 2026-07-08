import { aiRegistry } from '../providers/ai/registry';
import { AIServiceProvider } from '../providers/ai/types';

export class AIService {
  private provider: AIServiceProvider;

  constructor() {
    const providerName = process.env.AI_PROVIDER || 'mock';
    this.provider = aiRegistry.getProvider(providerName);
  }

  async generateScript(prompt: string) {
    return this.provider.generateScript(prompt);
  }

  async generateImage(prompt: string) {
    return this.provider.generateImage(prompt);
  }

  async generateVoiceover(text: string) {
    return this.provider.generateVoiceover(text);
  }

  async generateScenes(script: string) {
    return this.provider.generateScenes(script);
  }

  async generateSubtitles(audioUrl: string) {
    return this.provider.generateSubtitles(audioUrl);
  }
}

export const aiService = new AIService();
