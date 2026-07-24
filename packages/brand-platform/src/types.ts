// Core Models for Enterprise Brand Management Platform SDK
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  allowedColors: string[];
}

export interface TypographySet {
  headingFont: string;
  bodyFont: string;
  captionFont: string;
  fallbackFont: string;
  headingScale: {
    h1: string;
    h2: string;
    h3: string;
  };
  languageVariants?: Record<string, { headingFont: string; bodyFont: string }>;
}

export interface LogoRule {
  minWidthPx: number;
  safeAreaPaddingPx: number;
  preferredPlacement: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'centered';
}

export interface LogoSet {
  primaryUrl: string;
  secondaryUrl?: string;
  monochromeUrl?: string;
  darkModeUrl?: string;
  rules: LogoRule;
}

export interface MotionGuideline {
  approvedTransitions: string[]; // e.g. ['fade_in', 'slide', 'zoom']
  approvedEasing: string[]; // e.g. ['linear', 'ease_out_cubic']
  textAnimationPreset: string;
  logoAnimationPreset?: string;
}

export interface VoiceGuideline {
  tone: 'professional' | 'casual' | 'playful' | 'academic';
  prohibitedWords: string[];
  maxSentenceLength: number;
}

export interface BrandRule {
  id: string;
  category: 'color' | 'font' | 'logo' | 'layout' | 'voice' | 'motion';
  ruleExpression: string;
  severity: 'warning' | 'error';
  message: string;
}

export interface BrandTheme {
  id: string;
  name: string;
  colors: ColorPalette;
  typography: TypographySet;
  spacing: Record<string, string>; // e.g. { sm: '8px', md: '16px' }
  radius: Record<string, string>; // e.g. { sm: '4px', md: '8px' }
  shadows: Record<string, string>;
}

export interface BrandKit {
  id: string;
  name: string;
  theme: BrandTheme;
  logos: LogoSet;
  motion: MotionGuideline;
  voice: VoiceGuideline;
  rules: BrandRule[];
  version: string;
  updatedAt: string;
}

export interface BrandViolation {
  id: string;
  category: BrandRule['category'];
  severity: BrandRule['severity'];
  message: string;
  detectedValue: string;
  suggestedFix: string;
}

export interface BrandScore {
  consistencyScore: number; // 0 to 100
  violations: BrandViolation[];
  suggestedFixes: string[];
  approvalStatus: 'approved' | 'rejected' | 'conditional';
}

export interface BrandVersion {
  version: string;
  brandKit: BrandKit;
  createdAt: string;
  author: string;
  changelog?: string;
}

// Extensibility Plugin Interfaces
export interface BrandValidatorPlugin {
  id: string;
  name: string;
  validate: (project: any, kit: BrandKit) => Promise<BrandViolation[]>;
}

export interface ThemeGeneratorPlugin {
  id: string;
  name: string;
  generate: (kit: BrandKit) => Promise<BrandTheme>;
}
