export interface AIServiceProvider {
  generateScript(prompt: string): Promise<string>;
  generateScenes(script: string): Promise<any[]>;
  generateSubtitles(audioUrl: string): Promise<any[]>;
  generateImage(prompt: string): Promise<string>;
  generateVoiceover(text: string): Promise<string>;
}

export interface StockMediaProvider {
  searchMedia(query: string, type: 'video' | 'image' | 'audio'): Promise<any[]>;
}
