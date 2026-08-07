import { createTheme } from '@mui/material/styles';

/**
 * Design System 5.0 Standardized Design Tokens - Single Source of Truth
 */
export const DESIGN_TOKENS = {
  colors: {
    dark: {
      bgMain: '#050b14', // Ultra-dark base background
      bgPaper: '#0d1527', // Surface panel depth background
      bgSecondary: '#12203d', // Interactive cards & hover frames
      border: '#1b2f54', // Pixel-perfect premium divider borders
      borderHover: '#33528a',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      accentPrimary: '#00f0ff', // Cyberpunk futuristic blue neon accents
      accentSecondary: '#ec4899', // Professional magenta highlights
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      focus: 'rgba(0, 240, 255, 0.4)',
      selection: 'rgba(0, 240, 255, 0.15)'
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    pill: '9999px',
  },
  shadows: {
    panel: '0 4px 20px rgba(0, 0, 0, 0.4)',
    dropdown: '0 8px 32px rgba(0, 0, 0, 0.6)',
    active: '0 0 12px rgba(0, 240, 255, 0.35)',
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Inter", "Segoe UI", system-ui, sans-serif',
    size: {
      caption: '0.7rem',
      body2: '0.8rem',
      body1: '0.9rem',
      subtitle: '1rem',
      title: '1.25rem',
      hero: '2.25rem',
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  transitions: {
    default: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: DESIGN_TOKENS.colors.dark.accentPrimary,
    },
    secondary: {
      main: DESIGN_TOKENS.colors.dark.accentSecondary,
    },
    background: {
      default: DESIGN_TOKENS.colors.dark.bgMain,
      paper: DESIGN_TOKENS.colors.dark.bgPaper,
    },
    divider: DESIGN_TOKENS.colors.dark.border,
    success: {
      main: DESIGN_TOKENS.colors.dark.success,
    },
    warning: {
      main: DESIGN_TOKENS.colors.dark.warning,
    },
    error: {
      main: DESIGN_TOKENS.colors.dark.error,
    },
  },
  typography: {
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    button: {
      textTransform: 'none',
      fontWeight: DESIGN_TOKENS.typography.weight.semibold,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.sm,
          transition: DESIGN_TOKENS.transitions.default,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: DESIGN_TOKENS.colors.dark.bgPaper,
          borderColor: DESIGN_TOKENS.colors.dark.border,
        },
      },
    },
  },
});
