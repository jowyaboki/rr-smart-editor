import { AIScript, AIScene, AISubtitle, AIGeneratedImage, AIVoiceover } from '@ai-video-editor/shared';

export interface AIServiceProvider {
  generateScript(prompt: string): Promise<AIScript>;
  generateScenes(script: string): Promise<AIScene[]>;
  generateSubtitles(audioUrl: string): Promise<AISubtitle[]>;
  generateImage(prompt: string): Promise<AIGeneratedImage>;
  generateVoiceover(text: string): Promise<AIVoiceover>;
}

export interface StockMediaProvider {
  searchMedia(query: string, type: 'video' | 'image' | 'audio'): Promise<any[]>;
}
