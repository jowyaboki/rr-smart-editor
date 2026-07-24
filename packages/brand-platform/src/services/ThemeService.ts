import { BrandTheme, BrandKit, ThemeGeneratorPlugin } from '../types';

export class ThemeService {
  private generatorPlugins: ThemeGeneratorPlugin[] = [];

  public registerGenerator(plugin: ThemeGeneratorPlugin): void {
    this.generatorPlugins.push(plugin);
  }

  /**
   * Inherits and compiles child theme properties from parent kits
   */
  public compileTheme(kit: BrandKit, parentKit?: BrandKit): BrandTheme {
    if (!parentKit) {
      return kit.theme;
    }

    // Merge parent color values, falling back to child specific overrides
    return {
      id: kit.theme.id,
      name: kit.theme.name,
      colors: {
        ...parentKit.theme.colors,
        ...kit.theme.colors,
        semantic: {
          ...parentKit.theme.colors.semantic,
          ...kit.theme.colors.semantic,
        },
        allowedColors: [
          ...parentKit.theme.colors.allowedColors,
          ...kit.theme.colors.allowedColors,
        ],
      },
      typography: {
        ...parentKit.theme.typography,
        ...kit.theme.typography,
        headingScale: {
          ...parentKit.theme.typography.headingScale,
          ...kit.theme.typography.headingScale,
        },
      },
      spacing: {
        ...parentKit.theme.spacing,
        ...kit.theme.spacing,
      },
      radius: {
        ...parentKit.theme.radius,
        ...kit.theme.radius,
      },
      shadows: {
        ...parentKit.theme.shadows,
        ...kit.theme.shadows,
      },
    };
  }
}
