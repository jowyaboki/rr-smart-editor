import { create } from 'zustand';
import { Theme, MotionPreset, IconSet, TypographyScale, Token } from '../types';
import { webDesignSystemEngine } from '../engine';

interface DesignSystemState {
  activeThemeId: string;
  viewport: 'mobile' | 'tablet' | 'desktop';
  locale: string;
  themes: Record<string, Theme>;
  motionPresets: Record<string, MotionPreset>;
  iconSets: Record<string, IconSet>;
  resolvedTokens: Record<string, any>;

  // Actions
  setActiveTheme: (themeId: string) => void;
  setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => void;
  setLocale: (locale: string) => void;
  registerTheme: (theme: Theme) => void;
  registerTokenGroup: (groupKey: string, tokens: Record<string, Token>) => void;
  registerMotionPreset: (preset: MotionPreset) => void;
  registerIconSet: (iconSet: IconSet) => void;
  registerTypographyPack: (packId: string, pack: Record<string, TypographyScale>) => void;
  updateThemeOverrides: (themeId: string, category: string, overrides: Record<string, any>) => void;
}

export const useDesignSystemStore = create<DesignSystemState>((set, get) => {
  // Initial sync from the engine
  const engineState = webDesignSystemEngine.getState();
  const activeTheme = webDesignSystemEngine.getActiveTheme();
  const allResolved = webDesignSystemEngine.resolveAllActiveTokens({ viewport: 'desktop', locale: 'en' });

  return {
    activeThemeId: engineState.activeThemeId,
    viewport: 'desktop',
    locale: 'en',
    themes: engineState.themes,
    motionPresets: engineState.motionPresets,
    iconSets: engineState.iconSets,
    resolvedTokens: allResolved,

    setActiveTheme: (themeId: string) => {
      webDesignSystemEngine.setActiveTheme(themeId);
      const resolved = webDesignSystemEngine.resolveAllActiveTokens({
        viewport: get().viewport,
        locale: get().locale,
      });
      set({
        activeThemeId: themeId,
        resolvedTokens: resolved,
      });
    },

    setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => {
      set({ viewport });
      const resolved = webDesignSystemEngine.resolveAllActiveTokens({
        viewport,
        locale: get().locale,
      });
      set({ resolvedTokens: resolved });
    },

    setLocale: (locale: string) => {
      set({ locale });
      const resolved = webDesignSystemEngine.resolveAllActiveTokens({
        viewport: get().viewport,
        locale,
      });
      set({ resolvedTokens: resolved });
    },

    registerTheme: (theme: Theme) => {
      webDesignSystemEngine.registerTheme(theme);
      set({
        themes: { ...webDesignSystemEngine.getState().themes },
      });
    },

    registerTokenGroup: (groupKey: string, tokens: Record<string, Token>) => {
      webDesignSystemEngine.registerTokenGroup(groupKey, tokens);
      const engineState = webDesignSystemEngine.getState();
      const resolved = webDesignSystemEngine.resolveAllActiveTokens({
        viewport: get().viewport,
        locale: get().locale,
      });
      set({
        themes: { ...engineState.themes },
        resolvedTokens: resolved,
      });
    },

    registerMotionPreset: (preset: MotionPreset) => {
      webDesignSystemEngine.registerMotionPreset(preset);
      set({
        motionPresets: { ...webDesignSystemEngine.getState().motionPresets },
      });
    },

    registerIconSet: (iconSet: IconSet) => {
      webDesignSystemEngine.registerIconSet(iconSet);
      set({
        iconSets: { ...webDesignSystemEngine.getState().iconSets },
      });
    },

    registerTypographyPack: (packId: string, pack: Record<string, TypographyScale>) => {
      webDesignSystemEngine.registerTypographyPack(packId, pack);
      const engineState = webDesignSystemEngine.getState();
      const resolved = webDesignSystemEngine.resolveAllActiveTokens({
        viewport: get().viewport,
        locale: get().locale,
      });
      set({
        themes: { ...engineState.themes },
        resolvedTokens: resolved,
      });
    },

    updateThemeOverrides: (themeId: string, category: string, overrides: Record<string, any>) => {
      const state = webDesignSystemEngine.getState();
      const targetTheme = state.themes[themeId];
      if (targetTheme) {
        if (!targetTheme.tokens[category]) {
          targetTheme.tokens[category] = {};
        }
        for (const [k, v] of Object.entries(overrides)) {
          // If it is already a Token structure, preserve it, otherwise wrap it
          if (v && typeof v === 'object' && 'value' in v && 'type' in v) {
            targetTheme.tokens[category][k] = v;
          } else {
            const currentToken = targetTheme.tokens[category][k];
            if (currentToken && typeof currentToken === 'object' && 'type' in currentToken) {
              currentToken.value = v;
            } else {
              targetTheme.tokens[category][k] = v;
            }
          }
        }

        // Refresh
        const resolved = webDesignSystemEngine.resolveAllActiveTokens({
          viewport: get().viewport,
          locale: get().locale,
        });
        set({
          themes: { ...state.themes },
          resolvedTokens: resolved,
        });
      }
    },
  };
});
