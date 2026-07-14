import { CaptionPreset } from '@ai-video-editor/shared';

export const StyleService = {
  getBuiltInPresets(): CaptionPreset[] {
    return [
      { id: 'tiktok', name: 'TikTok Pop', styleId: 'bold-yellow', animationType: 'pop' },
      { id: 'classic', name: 'Classic Subtitle', styleId: 'regular-white', animationType: 'sentence' },
      { id: 'karaoke', name: 'Podcast Highlight', styleId: 'bold-white', animationType: 'word-by-word' }
    ];
  }
};
