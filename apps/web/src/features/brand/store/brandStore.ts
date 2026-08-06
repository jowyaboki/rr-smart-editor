import { create } from 'zustand';
import {
  BrandKit,
  BrandTheme,
  BrandScore,
  BrandVersion,
  BrandPlatformEngine,
} from '@ai-video-editor/brand-platform';

const localBrandEngine = new BrandPlatformEngine();

const initialBrandKit: BrandKit = {
  id: 'web_kit_default',
  name: 'Default Sundance Brand',
  theme: {
    id: 'web_theme_1',
    name: 'Standard Light Theme',
    colors: {
      primary: '#1976d2',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#ffffff',
      semantic: { success: '#4caf50', warning: '#ff9800', error: '#f44336', info: '#2196f3' },
      allowedColors: ['#1976d2', '#ec4899', '#ffffff'],
    },
    typography: {
      headingFont: 'Roboto',
      bodyFont: 'Arial',
      captionFont: 'Monospace',
      fallbackFont: 'sans-serif',
      headingScale: { h1: '32px', h2: '24px', h3: '18px' },
    },
    spacing: { sm: '8px', md: '16px' },
    radius: { sm: '4px', md: '8px' },
    shadows: { md: '0 4px 6px rgba(0,0,0,0.1)' },
  },
  logos: {
    primaryUrl: 'https://cdn.corp.com/primary_logo.png',
    rules: {
      minWidthPx: 120,
      safeAreaPaddingPx: 16,
      preferredPlacement: 'top_left',
    },
  },
  motion: {
    approvedTransitions: ['fade_in', 'slide'],
    approvedEasing: ['linear', 'ease_out_cubic'],
    textAnimationPreset: 'fade_in_words',
  },
  voice: {
    tone: 'professional',
    prohibitedWords: ['cheapest', 'scam', 'spam'],
    maxSentenceLength: 20,
  },
  rules: [],
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
};

interface BrandState {
  activeKit: BrandKit | null;
  brandKits: BrandKit[];
  complianceReport: BrandScore | null;
  versionsHistory: BrandVersion[];
  isLoading: boolean;

  // Actions
  initBrandStore: () => void;
  selectBrandKit: (id: string) => void;
  validateProject: (project: any) => Promise<void>;
  createVersionSnapshot: (version: string, author: string, changelog?: string) => void;
}

export const useBrandStore = create<BrandState>((set, get) => {
  return {
    activeKit: null,
    brandKits: [],
    complianceReport: null,
    versionsHistory: [],
    isLoading: false,

    initBrandStore: () => {
      localBrandEngine.brandService.registerBrandKit(initialBrandKit);
      localBrandEngine.versionService.createVersion('1.0.0', initialBrandKit, 'Jules', 'Initial release.');

      set({
        activeKit: initialBrandKit,
        brandKits: localBrandEngine.brandService.listBrandKits(),
        versionsHistory: localBrandEngine.versionService.listVersions(),
        complianceReport: null,
      });
    },

    selectBrandKit: (id) => {
      localBrandEngine.brandService.setActiveBrandKit(id);
      set({ activeKit: localBrandEngine.brandService.getActiveBrandKit(), complianceReport: null });
    },

    validateProject: async (project) => {
      const { activeKit } = get();
      if (!activeKit) return;

      set({ isLoading: true });
      try {
        const score = await localBrandEngine.validationService.validateProject(project, activeKit);
        set({ complianceReport: score });
      } catch (err) {
        console.error('Compliance validation audit failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    createVersionSnapshot: (version, author, changelog) => {
      const { activeKit } = get();
      if (!activeKit) return;

      localBrandEngine.versionService.createVersion(version, activeKit, author, changelog);
      set({
        versionsHistory: localBrandEngine.versionService.listVersions(),
      });
    },
  };
});
