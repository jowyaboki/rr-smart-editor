import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
  },
  shape: {
    borderRadius: radius.md,
  },
  typography: {
    ...typography as any,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          padding: '6px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
