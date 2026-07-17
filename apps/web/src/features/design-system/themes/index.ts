import { Theme } from '../types';
import {
  defaultColors,
  defaultSpacing,
  defaultRadius,
  defaultBorders,
  defaultElevation,
  defaultOpacity,
  defaultDuration,
  defaultEasing,
  defaultZIndex,
} from '../tokens';
import { defaultTypography } from '../typography';

export const darkTheme: Theme = {
  id: 'dark-theme',
  name: 'Default Dark Theme',
  version: '1.0.0',
  tokens: {
    colors: defaultColors,
    typography: defaultTypography,
    spacing: defaultSpacing,
    radius: defaultRadius,
    borders: defaultBorders,
    shadows: defaultElevation,
    opacity: defaultOpacity,
    duration: defaultDuration,
    easing: defaultEasing,
    zIndex: defaultZIndex,
  },
};

export const lightTheme: Theme = {
  id: 'light-theme',
  name: 'Default Light Theme',
  version: '1.0.0',
  tokens: {
    colors: {
      ...defaultColors,
      primary: { key: 'colors.primary', value: '#1976d2', type: 'color' },
      secondary: { key: 'colors.secondary', value: '#9c27b0', type: 'color' },
      background: { key: 'colors.background', value: '#f5f5f5', type: 'color' },
      surface: { key: 'colors.surface', value: '#ffffff', type: 'color' },
      text: { key: 'colors.text', value: '#121212', type: 'color' },
      textMuted: { key: 'colors.textMuted', value: '#666666', type: 'color' },
      border: { key: 'colors.border', value: '#e0e0e0', type: 'color' },
    },
    typography: defaultTypography,
    spacing: defaultSpacing,
    radius: defaultRadius,
    borders: {
      ...defaultBorders,
      thin: { key: 'borders.thin', value: '1px solid {colors.border}', type: 'border' },
      thick: { key: 'borders.thick', value: '2px solid {colors.border}', type: 'border' },
    },
    shadows: {
      ...defaultElevation,
      low: { key: 'shadows.low', value: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.12)', type: 'elevation' },
      medium: { key: 'shadows.medium', value: '0 3px 6px rgba(0,0,0,0.10), 0 3px 6px rgba(0,0,0,0.15)', type: 'elevation' },
    },
    opacity: defaultOpacity,
    duration: defaultDuration,
    easing: defaultEasing,
    zIndex: defaultZIndex,
  },
};

export const brandTheme: Theme = {
  id: 'brand-theme',
  name: 'RR Purple Brand Theme',
  parentId: 'dark-theme', // Inherits from dark-theme!
  version: '1.0.0',
  tokens: {
    colors: {
      primary: { key: 'colors.primary', value: '#8b5cf6', type: 'color', description: 'Purple brand primary' },
      secondary: { key: 'colors.secondary', value: '#ec4899', type: 'color', description: 'Pink brand secondary' },
    },
  },
};

export const customTheme: Theme = {
  id: 'custom-theme',
  name: 'Custom User Theme',
  parentId: 'dark-theme',
  version: '1.0.0',
  tokens: {},
};
