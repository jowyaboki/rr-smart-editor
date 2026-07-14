export type FontCategory = 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';

export interface BrandColor {
  id: string;
  name: string;
  value: string; // hex, rgb, etc.
}

export interface BrandPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string[];
  isDefault: boolean;
}

export interface BrandFont {
  id: string;
  name: string;
  family: string;
  category: FontCategory;
  url?: string;
  isCustom: boolean;
  fallback?: string;
}

export interface BrandLogo {
  id: string;
  name: string;
  url: string;
  type: 'svg' | 'png' | 'jpg';
  variant: 'primary' | 'secondary' | 'favicon' | 'other';
  isTransparent: boolean;
}

export interface BrandStyle {
  spacingScale: number; // base spacing unit
  cornerRadius: number; // base border radius
  shadowPreset: 'none' | 'light' | 'medium' | 'heavy';
}

export interface BrandTheme {
  palette: BrandPalette;
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  style: BrandStyle;
}
