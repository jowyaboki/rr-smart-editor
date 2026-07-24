import { describe, test } from 'node:test';
import assert from 'node:assert';
import { BrandPlatformEngine, BrandKit } from '../src/index';

describe('Brand Platform SDK Core Unit Tests', () => {

  const mockBrandKit: BrandKit = {
    id: 'brand_corp_1',
    name: 'Sundance Corp Brand',
    theme: {
      id: 'theme_corp_1',
      name: 'Corp Theme',
      colors: {
        primary: '#1976d2',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#ffffff',
        semantic: { success: '#4caf50', warning: '#ff9800', error: '#f44336', info: '#2196f3' },
        allowedColors: ['#1976d2', '#ec4899', '#ffffff'],
      },
      typography: {
        headingFont: 'Roboto',
        bodyFont: 'Arial',
        captionFont: 'Monospace',
        fallbackFont: 'sans-serif',
        headingScale: { h1: '32px', h2: '24px', h3: '18px' },
      },
      spacing: { sm: '8px', md: '16px' },
      radius: { sm: '4px', md: '8px' },
      shadows: { md: '0 4px 6px rgba(0,0,0,0.1)' },
    },
    logos: {
      primaryUrl: 'https://cdn.corp.com/primary_logo.png',
      rules: {
        minWidthPx: 120,
        safeAreaPaddingPx: 16,
        preferredPlacement: 'top_left',
      },
    },
    motion: {
      approvedTransitions: ['fade_in', 'slide'],
      approvedEasing: ['linear', 'ease_out_cubic'],
      textAnimationPreset: 'fade_in_words',
    },
    voice: {
      tone: 'professional',
      prohibitedWords: ['cheapest', 'scam', 'spam'],
      maxSentenceLength: 20,
    },
    rules: [],
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
  };

  test('Brand Registration & Switching', () => {
    const engine = new BrandPlatformEngine();

    engine.brandService.registerBrandKit(mockBrandKit);
    assert.strictEqual(engine.brandService.listBrandKits().length, 1);
    assert.strictEqual(engine.brandService.getActiveBrandKit()?.name, 'Sundance Corp Brand');
  });

  test('Design Token Inheritance Switch checks', () => {
    const engine = new BrandPlatformEngine();

    const parentKit = mockBrandKit;
    const childKit: BrandKit = {
      ...mockBrandKit,
      id: 'brand_sub_1',
      name: 'Sub Sundance Brand',
      theme: {
        ...mockBrandKit.theme,
        id: 'theme_sub_1',
        colors: {
          ...mockBrandKit.theme.colors,
          primary: '#e91e63', // child specific primary override
          allowedColors: ['#e91e63'],
        },
      },
    };

    const compiled = engine.themeService.compileTheme(childKit, parentKit);
    assert.strictEqual(compiled.colors.primary, '#e91e63'); // Overridden
    assert.strictEqual(compiled.colors.secondary, '#ec4899'); // Inherited from parent
  });

  test('Token Service - Generating token dictionaries', () => {
    const engine = new BrandPlatformEngine();
    const dictionary = engine.tokenService.generateTokenDictionary(mockBrandKit.theme);

    assert.strictEqual(dictionary['color-primary'], '#1976d2');
    assert.strictEqual(dictionary['spacing-sm'], '8px');
    assert.strictEqual(dictionary['radius-md'], '8px');
  });

  test('Brand Compliance validations and AI voice checks', async () => {
    const engine = new BrandPlatformEngine();

    const badProject = {
      name: 'Corrupted sundance project',
      voiceText: 'This is the cheapest editing soft on web!', // Prohibited word 'cheapest'
      timeline: {
        clips: [
          { id: 'clip_1', name: 'Text clip', type: 'text', style: { color: '#ff0000', fontFamily: 'Comic Sans' } }, // Color unallowed, font unapproved
          { id: 'logo_clip', name: 'Brand Logo', type: 'logo', style: { width: 50, placement: 'centered' } }, // Logo too small, unapproved placement
        ],
      },
    };

    const score = await engine.validationService.validateProject(badProject, mockBrandKit);

    // Checks violations are triggered correctly
    assert.ok(score.consistencyScore < 50); // High violations count
    assert.strictEqual(score.approvalStatus, 'rejected');

    const hasProhibitedVoice = score.violations.some(v => v.category === 'voice');
    assert.strictEqual(hasProhibitedVoice, true);

    const hasUnapprovedFont = score.violations.some(v => v.category === 'font');
    assert.strictEqual(hasUnapprovedFont, true);

    const hasTooSmallLogo = score.violations.some(v => v.category === 'logo' && v.message.includes('width'));
    assert.strictEqual(hasTooSmallLogo, true);
  });

  test('Brand Versioning & Restorations', () => {
    const engine = new BrandPlatformEngine();

    engine.versionService.createVersion('1.0.0', mockBrandKit, 'Jules', 'Initial brand kit release.');

    // Modify active kit
    const modifiedKit = { ...mockBrandKit, version: '1.1.0' };
    engine.versionService.createVersion('1.1.0', modifiedKit, 'Jules', 'Update branding color palettes.');

    const history = engine.versionService.listVersions();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].version, '1.0.0');
    assert.strictEqual(history[1].version, '1.1.0');
  });
});
