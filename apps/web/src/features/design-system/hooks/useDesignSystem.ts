import { useDesignSystemStore } from '../store/designSystemStore';
import { Theme, MotionPreset, IconSet, TypographyScale } from '../types';

export function useDesignSystem() {
  const store = useDesignSystemStore();

  const getResolvedTokenValue = (path: string): any => {
    // Resolve dotted path from store's resolvedTokens
    const parts = path.split('.');
    let current = store.resolvedTokens;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  };

  const getIconSvgPath = (iconName: string, iconSetId: string = 'standard-icons'): string => {
    const set = store.iconSets[iconSetId];
    return set?.icons[iconName] || '';
  };

  const getMotionPreset = (presetId: string): MotionPreset | undefined => {
    return store.motionPresets[presetId];
  };

  return {
    activeThemeId: store.activeThemeId,
    viewport: store.viewport,
    locale: store.locale,
    themes: store.themes,
    motionPresets: store.motionPresets,
    iconSets: store.iconSets,
    resolvedTokens: store.resolvedTokens,

    // Actions
    setActiveTheme: store.setActiveTheme,
    setViewport: store.setViewport,
    setLocale: store.setLocale,
    registerTheme: store.registerTheme,
    registerTokenGroup: store.registerTokenGroup,
    registerMotionPreset: store.registerMotionPreset,
    registerIconSet: store.registerIconSet,
    registerTypographyPack: store.registerTypographyPack,
    updateThemeOverrides: store.updateThemeOverrides,

    // Helpers
    getToken: getResolvedTokenValue,
    getIconSvgPath,
    getMotionPreset,
  };
}
