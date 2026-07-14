import { BrandPalette, BrandFont, BrandLogo, BrandStyle, BrandTheme } from './types';

export interface BrandKit {
  id: string;
  name: string;
  companyName: string;
  description?: string;
  palettes: BrandPalette[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  style: BrandStyle;
  toneMetadata?: {
    voice: string;
    targetAudience: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}
