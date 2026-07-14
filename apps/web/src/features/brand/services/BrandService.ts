import { BrandKit } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const BrandService = {
  createDefaultKit(name: string, company: string): BrandKit {
    return {
      id: uuidv4(),
      name,
      companyName: company,
      palettes: [{
        id: uuidv4(),
        name: 'Default Palette',
        primary: '#1976d2',
        secondary: '#9c27b0',
        accent: ['#ff9800'],
        isDefault: true
      }],
      fonts: [{
        id: uuidv4(),
        name: 'Roboto',
        family: 'Roboto',
        category: 'sans-serif',
        isCustom: false
      }],
      logos: [],
      style: {
        spacingScale: 8,
        cornerRadius: 4,
        shadowPreset: 'medium'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};
