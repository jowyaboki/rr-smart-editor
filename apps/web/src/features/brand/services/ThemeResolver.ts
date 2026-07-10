import { BrandKit, BrandTheme } from '@ai-video-editor/shared';

export const ThemeResolver = {
  resolve(kit: BrandKit): BrandTheme {
    const defaultPalette = kit.palettes.find(p => p.isDefault) || kit.palettes[0];
    const headingFont = kit.fonts.find(f => f.category === 'display' || f.category === 'serif') || kit.fonts[0];
    const bodyFont = kit.fonts.find(f => f.category === 'sans-serif') || kit.fonts[0];

    return {
      palette: defaultPalette,
      fonts: {
        heading: headingFont?.family || 'Arial',
        body: bodyFont?.family || 'Arial',
        monospace: 'Courier New'
      },
      style: kit.style
    };
  }
};
