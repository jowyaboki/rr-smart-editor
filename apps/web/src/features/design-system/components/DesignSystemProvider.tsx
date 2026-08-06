import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Theme } from '../types';
import { webDesignSystemEngine } from '../engine';

interface DesignSystemProviderProps {
  children: React.ReactNode;
  themeId?: string; // Optional: specify a nested theme
}

const NestedThemeContext = createContext<string | undefined>(undefined);

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  themeId,
}) => {
  const { activeThemeId, resolvedTokens, themes } = useDesignSystem();

  // Determine if this is a nested theme provider or root
  const parentThemeId = useContext(NestedThemeContext);
  const currentThemeId = themeId || parentThemeId || activeThemeId;

  // Resolve tokens for the current themeId (handles nesting properly!)
  const currentResolvedTokens = useMemo(() => {
    if (currentThemeId === activeThemeId) {
      return resolvedTokens;
    }
    try {
      const targetTheme = webDesignSystemEngine.getTheme(currentThemeId);
      return webDesignSystemEngine.resolveAllActiveTokens(); // Fallback or compute for target
    } catch {
      return resolvedTokens;
    }
  }, [currentThemeId, activeThemeId, resolvedTokens]);

  // Generate CSS Custom Properties object
  const cssVariables = useMemo(() => {
    const variables: Record<string, string> = {};

    function processCategory(groupKey: string, groupObj: any) {
      if (!groupObj || typeof groupObj !== 'object') return;

      for (const [key, val] of Object.entries(groupObj)) {
        if (val === null || val === undefined) continue;

        const cssKey = `--${groupKey}-${key}`;

        if (typeof val === 'object' && 'fontFamily' in val) {
          // It's a resolved TypographyScale
          const scale = val as any;
          variables[`--typography-${key}-fontFamily`] = String(scale.fontFamily);
          variables[`--typography-${key}-fontSize`] = String(scale.fontSize);
          variables[`--typography-${key}-fontWeight`] = String(scale.fontWeight);
          variables[`--typography-${key}-lineHeight`] = String(scale.lineHeight);
          if (scale.letterSpacing) {
            variables[`--typography-${key}-letterSpacing`] = String(scale.letterSpacing);
          }
        } else if (typeof val === 'object') {
          // If nested object, recurse
          processCategory(`${groupKey}-${key}`, val);
        } else {
          // Simple primitive token value
          variables[cssKey] = String(val);
        }
      }
    }

    for (const [groupKey, groupObj] of Object.entries(currentResolvedTokens)) {
      processCategory(groupKey, groupObj);
    }

    return variables;
  }, [currentResolvedTokens]);

  // Apply variables to root element if this is the root provider
  useEffect(() => {
    if (!themeId) {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(cssVariables)) {
        root.style.setProperty(key, value);
      }
    }
  }, [cssVariables, themeId]);

  if (themeId) {
    // If it is a nested theme, wrap in a div and apply variables inline locally
    return (
      <NestedThemeContext.Provider value={themeId}>
        <div style={cssVariables as React.CSSProperties} className={`theme-scope-${themeId}`}>
          {children}
        </div>
      </NestedThemeContext.Provider>
    );
  }

  return (
    <NestedThemeContext.Provider value={undefined}>
      {children}
    </NestedThemeContext.Provider>
  );
};
