import { AIServiceProvider } from './types';
import {
  AIScript,
  AIScene,
  AISubtitle,
  AIGeneratedImage,
  AIVoiceover,
} from '@ai-video-editor/shared';

export class OpenAIProvider implements AIServiceProvider {
  async generateScript(prompt: string): Promise<AIScript> {
    // Real implementation would call OpenAI SDK here
    throw new Error('OpenAI API Key not configured');
  }
  async generateScenes(script: string): Promise<AIScene[]> {
    throw new Error('Not implemented');
  }
  async generateSubtitles(audioUrl: string): Promise<AISubtitle[]> {
    throw new Error('Not implemented');
  }
  async generateImage(prompt: string): Promise<AIGeneratedImage> {
    throw new Error('Not implemented');
  }
  async generateVoiceover(text: string): Promise<AIVoiceover> {
    throw new Error('Not implemented');
  }
}
