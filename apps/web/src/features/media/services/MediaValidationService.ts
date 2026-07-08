export const MediaValidationService = {
  getAssetType(mimeType: string, filename: string): any {
    if (mimeType.startsWith('image/')) {
      if (mimeType.includes('svg')) return 'svg';
      if (mimeType.includes('gif')) return 'gif';
      return 'image';
    }
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (filename.endsWith('.json')) return 'lottie';
    if (mimeType.includes('font') || filename.endsWith('.ttf') || filename.endsWith('.otf') || filename.endsWith('.woff')) return 'font';
    return 'image'; // Default fallback
  }
};
