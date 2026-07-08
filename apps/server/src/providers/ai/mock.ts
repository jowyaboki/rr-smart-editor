import { AIServiceProvider } from './types';
import { AIScript, AIScene, AISubtitle, AIGeneratedImage, AIVoiceover } from '@ai-video-editor/shared';

export class MockAIProvider implements AIServiceProvider {
  async generateScript(prompt: string): Promise<AIScript> {
    return { content: `Mock generated script for: ${prompt}` };
  }
  async generateScenes(script: string): Promise<AIScene[]> {
    return [{ id: '1', title: 'Mock Scene', description: 'Mock Description', duration: 5 }];
  }
  async generateSubtitles(audioUrl: string): Promise<AISubtitle[]> {
    return [{ start: 0, end: 5, text: 'Mock Subtitle' }];
  }
  async generateImage(prompt: string): Promise<AIGeneratedImage> {
    return { url: 'https://example.com/mock-image.jpg' };
  }
  async generateVoiceover(text: string): Promise<AIVoiceover> {
    return { url: 'https://example.com/mock-voiceover.mp3', duration: 10 };
  }
}
