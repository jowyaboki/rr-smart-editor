import { BrandFont } from '@ai-video-editor/shared';

export const FontService = {
  async registerFont(font: BrandFont): Promise<void> {
    if (font.url) {
      const fontFace = new FontFace(font.family, `url(${font.url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
    }
  }
};
