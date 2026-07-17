import { TypographyScale } from '../types';

export const defaultTypography: Record<string, TypographyScale> = {
  h1: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: { mobile: '24px', tablet: '32px', desktop: '40px' },
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    languageOverrides: {
      ja: {
        fontFamily: '"Noto Sans JP", sans-serif',
      },
    },
  },
  h2: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: { mobile: '20px', tablet: '24px', desktop: '30px' },
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    languageOverrides: {
      ja: {
        fontFamily: '"Noto Sans JP", sans-serif',
      },
    },
  },
  body1: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: { mobile: '14px', tablet: '16px', desktop: '16px' },
    fontWeight: 400,
    lineHeight: 1.5,
    languageOverrides: {
      ja: {
        fontFamily: '"Noto Sans JP", sans-serif',
      },
    },
  },
  body2: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: { mobile: '12px', tablet: '14px', desktop: '14px' },
    fontWeight: 400,
    lineHeight: 1.43,
  },
  button: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    fontSize: { mobile: '14px', tablet: '14px', desktop: '14px' },
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
  },
};
