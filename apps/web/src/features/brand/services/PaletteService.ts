import { BrandPalette } from '@ai-video-editor/shared';

export const PaletteService = {
  validateContrast(primary: string, secondary: string): boolean {
    // Simple mock for contrast validation
    return true;
  },

  generatePalette(baseColor: string): Partial<BrandPalette> {
    return {
      primary: baseColor,
      secondary: '#ffffff', // simple default
      accent: ['#ff0000', '#00ff00'],
      isDefault: false
    };
  }
};
