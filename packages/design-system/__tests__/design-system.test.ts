import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  Theme,
  TokenResolver,
  ThemeService,
  MigrationService,
  ValidationService,
  SerializationService,
  DesignSystemService,
} from '../src/index';

describe('Design System Engine Core Unit Tests', () => {

  test('Token Resolution - Basic values and recursive references', () => {
    const theme: Theme = {
      id: 'test-theme',
      name: 'Test Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          primary: '#1976d2',
          primaryHover: '{colors.primary}',
          primaryButton: '1px solid {colors.primaryHover}',
        },
        spacing: {
          sm: '8px',
          md: '16px',
        },
      },
    };

    const flat = TokenResolver.flattenTokens(theme.tokens);
    assert.strictEqual(flat['colors.primary'], '#1976d2');
    assert.strictEqual(flat['colors.primaryHover'], '{colors.primary}');

    // Resolve simple reference
    const resolvedPrimaryHover = TokenResolver.resolveToken('colors.primaryHover', theme);
    assert.strictEqual(resolvedPrimaryHover, '#1976d2');

    // Resolve nested/embedded reference
    const resolvedPrimaryButton = TokenResolver.resolveToken('colors.primaryButton', theme);
    assert.strictEqual(resolvedPrimaryButton, '1px solid #1976d2');

    // Resolve all active tokens
    const resolvedAll = TokenResolver.resolveThemeTokens(theme);
    assert.strictEqual(resolvedAll.colors.primary, '#1976d2');
    assert.strictEqual(resolvedAll.colors.primaryHover, '#1976d2');
    assert.strictEqual(resolvedAll.colors.primaryButton, '1px solid #1976d2');
  });

  test('Token Resolution - Responsive scales and language overrides', () => {
    const theme: Theme = {
      id: 'test-theme',
      name: 'Test Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          primary: '#1976d2',
        },
        typography: {
          h1: {
            fontFamily: 'Roboto',
            fontSize: { mobile: '18px', tablet: '24px', desktop: '32px' },
            fontWeight: 700,
            lineHeight: 1.2,
            languageOverrides: {
              ja: {
                fontFamily: 'Noto Sans JP',
                fontSize: { mobile: '16px', desktop: '28px' },
              },
            },
          },
        },
      },
    };

    // 1. Resolve for default (desktop viewport, english locale)
    const resolvedDefault = TokenResolver.resolveToken('typography.h1', theme);
    assert.strictEqual(resolvedDefault.fontFamily, 'Roboto');
    assert.strictEqual(resolvedDefault.fontSize, '32px');

    // 2. Resolve for mobile viewport
    const resolvedMobile = TokenResolver.resolveToken('typography.h1', theme, { viewport: 'mobile' });
    assert.strictEqual(resolvedMobile.fontSize, '18px');

    // 3. Resolve for tablet viewport
    const resolvedTablet = TokenResolver.resolveToken('typography.h1', theme, { viewport: 'tablet' });
    assert.strictEqual(resolvedTablet.fontSize, '24px');

    // 4. Resolve with Japanese locale override
    const resolvedJa = TokenResolver.resolveToken('typography.h1', theme, { locale: 'ja' });
    assert.strictEqual(resolvedJa.fontFamily, 'Noto Sans JP');
    assert.strictEqual(resolvedJa.fontSize, '28px'); // English desktop override to Noto Sans JP but resolved with default viewport

    // 5. Resolve with Japanese locale AND mobile viewport
    const resolvedJaMobile = TokenResolver.resolveToken('typography.h1', theme, { locale: 'ja', viewport: 'mobile' });
    assert.strictEqual(resolvedJaMobile.fontFamily, 'Noto Sans JP');
    assert.strictEqual(resolvedJaMobile.fontSize, '16px');
  });

  test('Circular Dependency and Missing Token Detections', () => {
    const cyclicTheme: Theme = {
      id: 'cyclic',
      name: 'Cyclic Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          a: '{colors.b}',
          b: '{colors.c}',
          c: '{colors.a}',
        },
      },
    };

    // Check that TokenResolver throws or flags circle
    assert.throws(() => {
      TokenResolver.resolveToken('colors.a', cyclicTheme);
    }, /Circular reference/);

    const missingTheme: Theme = {
      id: 'missing',
      name: 'Missing Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          a: '{colors.nonexistent}',
        },
      },
    };

    assert.throws(() => {
      TokenResolver.resolveToken('colors.a', missingTheme);
    }, /Missing token/);
  });

  test('Theme Inheritance & Parent-Child theme resolution', () => {
    const parentTheme: Theme = {
      id: 'parent',
      name: 'Parent Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          primary: '#111111',
          secondary: '#222222',
          background: '#000000',
        },
        spacing: {
          sm: '8px',
          md: '16px',
        },
      },
    };

    const childTheme: Theme = {
      id: 'child',
      name: 'Child Theme',
      parentId: 'parent',
      version: '1.0.0',
      tokens: {
        colors: {
          primary: '#999999', // override primary
        },
        spacing: {
          md: '20px', // override md spacing
        },
      },
    };

    const allThemes = { parent: parentTheme, child: childTheme };

    // Resolve inheritance
    const resolvedTheme = ThemeService.resolveInheritedTheme(childTheme, allThemes);

    // Verify overridden values
    assert.strictEqual(resolvedTheme.tokens.colors.primary, '#999999');
    assert.strictEqual(resolvedTheme.tokens.spacing.md, '20px');

    // Verify inherited/parent values are retained
    assert.strictEqual(resolvedTheme.tokens.colors.secondary, '#222222');
    assert.strictEqual(resolvedTheme.tokens.colors.background, '#000000');
    assert.strictEqual(resolvedTheme.tokens.spacing.sm, '8px');
  });

  test('Static Analysis Validation - Missing, Invalid and Circular References', () => {
    const brokenTheme: Theme = {
      id: 'broken',
      name: 'Broken Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          ok: '#ffffff',
          bad1: '{colors.missing}', // missing token reference
          loopA: '{colors.loopB}', // circular loop
          loopB: '{colors.loopA}',
          unusedCustom: 'Hello, I am never referenced!',
        },
      },
    };

    const errors = ValidationService.validateTheme(brokenTheme);

    // Assert missing token detected
    const missing = errors.find(e => e.type === 'missing_token');
    assert.ok(missing);
    assert.strictEqual(missing.path, 'colors.bad1');

    // Assert circular reference detected
    const circle = errors.find(e => e.type === 'circular_reference');
    assert.ok(circle);

    // Assert unused token warning detected (note: custom key "colors.unusedCustom" will be flagged)
    const unused = errors.find(e => e.type === 'unused_token');
    assert.ok(unused);
    assert.strictEqual(unused.path, 'colors.unusedCustom');
    assert.strictEqual(unused.severity, 'warning');
  });

  test('Migration Service - Scheme versioning and upgrades', () => {
    const oldTheme: Theme = {
      id: 'old-brand',
      name: 'Old Brand theme',
      version: '1.0.0',
      tokens: {
        colors: {
          brandPrimary: '#3b82f6',
          brandSecondary: '#ec4899',
          surface: '#ffffff',
        },
        spacing: {
          normal: '12px',
        },
      },
    };

    // Migrate to 2.0.0
    const upgraded = MigrationService.migrateTheme(oldTheme, '2.0.0');

    assert.strictEqual(upgraded.version, '2.0.0');
    assert.strictEqual(upgraded.tokens.colors.primary, '#3b82f6');
    assert.strictEqual(upgraded.tokens.colors.secondary, '#ec4899');
    assert.strictEqual(upgraded.tokens.spacing.md, '12px');
    assert.strictEqual(upgraded.tokens.colors.brandPrimary, undefined);
    assert.strictEqual(upgraded.tokens.spacing.normal, undefined);
  });

  test('Serialization Service - JSON packaging and Import/Export', () => {
    const originalTheme: Theme = {
      id: 'serialized-theme',
      name: 'JSON Theme',
      version: '1.0.0',
      tokens: {
        colors: {
          primary: '#111',
          primaryHover: '{colors.primary}',
        },
      },
    };

    // Export to JSON string
    const json = SerializationService.exportTheme(originalTheme);
    assert.ok(typeof json === 'string');
    assert.ok(json.includes('serialized-theme'));

    // Import from JSON string
    const imported = SerializationService.importTheme(json, '1.0.0');
    assert.strictEqual(imported.id, 'serialized-theme');
    assert.strictEqual(imported.tokens.colors.primary, '#111');

    // Verify exporting other packages
    const brandJson = SerializationService.exportBrandPackage('PurpleBrand', { primaryColor: '#8b5cf6' });
    const importedBrand = SerializationService.importBrandPackage(brandJson);
    assert.strictEqual(importedBrand.name, 'PurpleBrand');
    assert.strictEqual((importedBrand.tokens as any).primaryColor, '#8b5cf6');
  });

  test('DesignSystemService - Master registry and Plugin Support', () => {
    const ds = new DesignSystemService();

    const themeA: Theme = { id: 'theme-a', name: 'Theme A', version: '1.0.0', tokens: { colors: { main: '#aaa' } } };
    const themeB: Theme = { id: 'theme-b', name: 'Theme B', version: '1.0.0', tokens: { colors: { main: '#bbb' } } };

    ds.registerTheme(themeA);
    ds.registerTheme(themeB);

    assert.strictEqual(ds.getActiveTheme().id, 'theme-a');

    ds.setActiveTheme('theme-b');
    assert.strictEqual(ds.getActiveTheme().id, 'theme-b');

    // Register plugin contribution
    ds.registerPluginContribution({
      tokenGroup: {
        groupKey: 'plugin-group',
        tokens: {
          myPluginToken: { key: 'plugin-group.myPluginToken', value: '#fff', type: 'color' },
        },
      },
      motionPreset: {
        id: 'zoom-fade',
        name: 'Zoom & Fade',
        properties: { opacity: [0, 1] },
        duration: 300,
        easing: 'ease-out',
      },
    });

    // Check that plugin token is available and resolved under active theme
    const val = ds.resolveActiveToken('plugin-group.myPluginToken');
    assert.strictEqual(val, '#fff');

    // Check plugin motion preset
    const preset = ds.getMotionPreset('zoom-fade');
    assert.strictEqual(preset.name, 'Zoom & Fade');
  });
});
