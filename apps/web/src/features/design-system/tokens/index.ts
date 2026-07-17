import { Token } from '../types';

export const defaultColors: Record<string, Token> = {
  primary: { key: 'colors.primary', value: '#90caf9', type: 'color', description: 'Primary brand color' },
  secondary: { key: 'colors.secondary', value: '#f48fb1', type: 'color', description: 'Secondary brand color' },
  background: { key: 'colors.background', value: '#0a1929', type: 'color', description: 'Primary background' },
  surface: { key: 'colors.surface', value: '#102031', type: 'color', description: 'Surface/card background' },
  text: { key: 'colors.text', value: '#ffffff', type: 'color', description: 'Primary text color' },
  textMuted: { key: 'colors.textMuted', value: '#b2bac2', type: 'color', description: 'Secondary/muted text color' },
  border: { key: 'colors.border', value: '#1e293b', type: 'color', description: 'Divider/border color' },
  success: { key: 'colors.success', value: '#4caf50', type: 'color', description: 'Success status color' },
  error: { key: 'colors.error', value: '#f44336', type: 'color', description: 'Error status color' },
};

export const defaultSpacing: Record<string, Token> = {
  xs: { key: 'spacing.xs', value: '4px', type: 'spacing', description: 'Extra small spacing' },
  sm: { key: 'spacing.sm', value: '8px', type: 'spacing', description: 'Small spacing' },
  md: { key: 'spacing.md', value: '16px', type: 'spacing', description: 'Medium spacing (default)' },
  lg: { key: 'spacing.lg', value: '24px', type: 'spacing', description: 'Large spacing' },
  xl: { key: 'spacing.xl', value: '32px', type: 'spacing', description: 'Extra large spacing' },
};

export const defaultRadius: Record<string, Token> = {
  none: { key: 'radius.none', value: '0px', type: 'radius', description: 'No border radius' },
  xs: { key: 'radius.xs', value: '2px', type: 'radius', description: 'Extra small border radius' },
  sm: { key: 'radius.sm', value: '4px', type: 'radius', description: 'Small border radius' },
  md: { key: 'radius.md', value: '8px', type: 'radius', description: 'Medium border radius' },
  lg: { key: 'radius.lg', value: '12px', type: 'radius', description: 'Large border radius' },
  full: { key: 'radius.full', value: '9999px', type: 'radius', description: 'Pill/circle border radius' },
};

export const defaultBorders: Record<string, Token> = {
  thin: { key: 'borders.thin', value: '1px solid {colors.border}', type: 'border', description: 'Thin border using color reference' },
  thick: { key: 'borders.thick', value: '2px solid {colors.border}', type: 'border', description: 'Thick border' },
  primary: { key: 'borders.primary', value: '2px solid {colors.primary}', type: 'border', description: 'Primary focused border' },
};

export const defaultElevation: Record<string, Token> = {
  none: { key: 'shadows.none', value: 'none', type: 'elevation' },
  low: { key: 'shadows.low', value: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', type: 'elevation' },
  medium: { key: 'shadows.medium', value: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)', type: 'elevation' },
  high: { key: 'shadows.high', value: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)', type: 'elevation' },
};

export const defaultOpacity: Record<string, Token> = {
  subtle: { key: 'opacity.subtle', value: 0.08, type: 'opacity' },
  medium: { key: 'opacity.medium', value: 0.5, type: 'opacity' },
  heavy: { key: 'opacity.heavy', value: 0.8, type: 'opacity' },
  full: { key: 'opacity.full', value: 1.0, type: 'opacity' },
};

export const defaultDuration: Record<string, Token> = {
  fast: { key: 'duration.fast', value: '150ms', type: 'duration' },
  normal: { key: 'duration.normal', value: '300ms', type: 'duration' },
  slow: { key: 'duration.slow', value: '500ms', type: 'duration' },
};

export const defaultEasing: Record<string, Token> = {
  standard: { key: 'easing.standard', value: 'cubic-bezier(0.4, 0, 0.2, 1)', type: 'easing' },
  decelerate: { key: 'easing.decelerate', value: 'cubic-bezier(0, 0, 0.2, 1)', type: 'easing' },
  accelerate: { key: 'easing.accelerate', value: 'cubic-bezier(0.4, 0, 1, 1)', type: 'easing' },
};

export const defaultZIndex: Record<string, Token> = {
  base: { key: 'zIndex.base', value: 0, type: 'zIndex' },
  dropdown: { key: 'zIndex.dropdown', value: 1000, type: 'zIndex' },
  sticky: { key: 'zIndex.sticky', value: 1020, type: 'zIndex' },
  overlay: { key: 'zIndex.overlay', value: 1040, type: 'zIndex' },
  modal: { key: 'zIndex.modal', value: 1060, type: 'zIndex' },
  tooltip: { key: 'zIndex.tooltip', value: 1080, type: 'zIndex' },
};
