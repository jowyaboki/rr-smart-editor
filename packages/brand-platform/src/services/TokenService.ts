import { BrandTheme } from '../types';

export class TokenService {
  /**
   * Compiles and outputs design token JSON dictionary overrides
   */
  public generateTokenDictionary(theme: BrandTheme): Record<string, string> {
    const dictionary: Record<string, string> = {};

    // 1. Spacing tokens
    Object.keys(theme.spacing).forEach(key => {
      dictionary[`spacing-${key}`] = theme.spacing[key];
    });

    // 2. Chromatic colors tokens
    dictionary['color-primary'] = theme.colors.primary;
    dictionary['color-secondary'] = theme.colors.secondary;
    dictionary['color-accent'] = theme.colors.accent;
    dictionary['color-bg'] = theme.colors.background;

    // 3. Border radius tokens
    Object.keys(theme.radius).forEach(key => {
      dictionary[`radius-${key}`] = theme.radius[key];
    });

    return dictionary;
  }
}
