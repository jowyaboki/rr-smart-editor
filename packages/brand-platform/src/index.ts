import { BrandService } from './services/BrandService';
import { BrandValidationService } from './services/BrandValidationService';
import { ThemeService } from './services/ThemeService';
import { TokenService } from './services/TokenService';
import { BrandAnalyticsService } from './services/BrandAnalyticsService';
import { BrandVersionService } from './services/BrandVersionService';
import {
  ColorPalette,
  TypographySet,
  LogoRule,
  LogoSet,
  MotionGuideline,
  VoiceGuideline,
  BrandRule,
  BrandTheme,
  BrandKit,
  BrandViolation,
  BrandScore,
  BrandVersion,
  BrandValidatorPlugin,
  ThemeGeneratorPlugin,
} from './types';

export * from './types';
export * from './services/BrandService';
export * from './services/BrandValidationService';
export * from './services/ThemeService';
export * from './services/TokenService';
export * from './services/BrandAnalyticsService';
export * from './services/BrandVersionService';

export class BrandPlatformEngine {
  public brandService: BrandService;
  public validationService: BrandValidationService;
  public themeService: ThemeService;
  public tokenService: TokenService;
  public analyticsService: BrandAnalyticsService;
  public versionService: BrandVersionService;

  constructor() {
    this.brandService = new BrandService();
    this.validationService = new BrandValidationService();
    this.themeService = new ThemeService();
    this.tokenService = new TokenService();
    this.analyticsService = new BrandAnalyticsService();
    this.versionService = new BrandVersionService();
  }
}

export const globalBrandPlatformEngine = new BrandPlatformEngine();
