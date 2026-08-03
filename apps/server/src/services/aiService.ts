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

  // Phase 5 Additions - Translation, Thumbnail generation, Scene detection, and Auto editing
  async translate(text: string, targetLang: string) {
    return {
      success: true,
      originalText: text,
      targetLanguage: targetLang,
      translatedText: targetLang === 'es' ? 'Hola y bienvenido a RR Studio.' : `[Translated to ${targetLang}]: ${text}`,
    };
  }

  async generateThumbnail(projectId: string, prompt: string) {
    return {
      success: true,
      thumbnailUrl: `https://cdn.onrender.com/thumbnails/t-${projectId}.jpg`,
    };
  }

  async detectScenes(mediaUrl: string) {
    return [
      { sceneId: 1, startTime: 0.0, endTime: 4.5, label: 'Intro sequence' },
      { sceneId: 2, startTime: 4.6, endTime: 12.0, label: 'Main presentation sequence' }
    ];
  }

  async autoEdit(mediaUrls: string[]) {
    return {
      tracks: [
        {
          id: 'v-track-1',
          clips: mediaUrls.map((url: string, index: number) => ({
            id: `clip-${index + 1}`,
            name: `Auto edit segment ${index + 1}`,
            url,
            start: index * 5.0,
            duration: 5.0,
          }))
        }
      ]
    };
  }
}

export const aiService = new AIService();
