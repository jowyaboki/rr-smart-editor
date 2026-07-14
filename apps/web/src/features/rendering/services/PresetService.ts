import { RenderPreset } from '../types';

export const PresetService = {
  getPresets(): RenderPreset[] {
    return [
      { id: 'yt-1080', name: 'YouTube 1080p', category: 'Social', settings: { width: 1920, height: 1080, fps: 30, codec: 'h264' } },
      { id: 'yt-shorts', name: 'YouTube Shorts', category: 'Social', settings: { width: 1080, height: 1920, fps: 30, codec: 'h264' } },
      { id: 'ig-reel', name: 'Instagram Reel', category: 'Social', settings: { width: 1080, height: 1920, fps: 30, codec: 'h264' } },
      { id: 'tiktok', name: 'TikTok', category: 'Social', settings: { width: 1080, height: 1920, fps: 30, codec: 'h264' } },
      { id: '4k-uhd', name: '4K UHD', category: 'Pro', settings: { width: 3840, height: 2160, fps: 60, codec: 'h265' } },
    ];
  }
};
