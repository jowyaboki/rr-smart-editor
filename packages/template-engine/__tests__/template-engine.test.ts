import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  TemplateEngine,
  ValidationService,
  ParameterResolver,
  TemplateRuntime,
} from '../src/index';

describe('Smart Template Engine Core Unit Tests', () => {

  test('Dynamic parameter schema validations', () => {
    const valService = new ValidationService();

    const parameters = [
      { id: 'logo_scale', name: 'Logo Scale', type: 'number' as const, defaultValue: 1.0, required: true, min: 0.1, max: 2.0 },
      { id: 'subtitle', name: 'Subtitle text', type: 'text' as const, defaultValue: '', required: false },
    ];

    // 1. Success check
    const audit1 = valService.validateValues(parameters, { logo_scale: 1.5 });
    assert.strictEqual(audit1.valid, true);

    // 2. Range boundary error check
    const audit2 = valService.validateValues(parameters, { logo_scale: 5.0 }); // 5.0 exceeds max boundary 2.0
    assert.strictEqual(audit2.valid, false);
    assert.ok(audit2.errors[0].includes('OUT_OF_BOUNDS'));
  });

  test('Conditional parameter visibility trigger logic', () => {
    const valService = new ValidationService();

    const parameters = [
      { id: 'show_logo', name: 'Show Logo', type: 'boolean' as const, defaultValue: false, required: true },
      // logo_url depends on show_logo being true
      {
        id: 'logo_url',
        name: 'Logo Asset URL',
        type: 'text' as const,
        defaultValue: '',
        required: true,
        dependsOn: {
          parameterId: 'show_logo',
          conditionValue: true,
        },
      },
    ];

    // 1. If show_logo is false, logo_url required constraint is skipped
    const audit1 = valService.validateValues(parameters, { show_logo: false });
    assert.strictEqual(audit1.valid, true);

    // 2. If show_logo is true, logo_url required constraint is active and catches missing field
    const audit2 = valService.validateValues(parameters, { show_logo: true });
    assert.strictEqual(audit2.valid, false);
    assert.ok(audit2.errors[0].includes('PARAMETER_REQUIRED'));
  });

  test('Param Value interpolations into Target Paths slots', () => {
    const resolver = new ParameterResolver();

    const blueprintProject = {
      timeline: {
        tracks: [
          {
            id: 'v-track',
            clips: [
              { id: 'clip-1', name: 'Intro Blueprint', style: { color: '#000000' } }
            ],
          }
        ],
      },
    };

    const slots = [
      { id: 'title_val', name: 'Title Text', targetPath: 'timeline.tracks[0].clips[0].name', type: 'text' as const },
      { id: 'bg_color', name: 'BG Color', targetPath: 'timeline.tracks[0].clips[0].style.color', type: 'color' as const },
    ];

    const values = {
      title_val: 'Custom Promo Title',
      bg_color: '#ff0000',
    };

    const instantiated = resolver.resolveBindings(blueprintProject, slots, values);

    // Verify correct slot mapping interpolations
    assert.strictEqual(instantiated.timeline.tracks[0].clips[0].name, 'Custom Promo Title');
    assert.strictEqual(instantiated.timeline.tracks[0].clips[0].style.color, '#ff0000');
  });

  test('Template Versions migration and schema upgrades', () => {
    const runtime = new TemplateRuntime();

    const legacyManifest = {
      templateId: 'tpl-business',
      version: '1.0.0',
      parameters: [
        { id: 'title', name: 'Title', type: 'text', defaultValue: 'Business' } // missing group category
      ],
    };

    const upgraded = runtime.migrateManifest('tpl-business', legacyManifest, '2.0.0');

    // Schema upgrade mapping fields
    assert.strictEqual(upgraded.version, '2.0.0');
    assert.strictEqual(upgraded.parameters[0].group, 'general');
  });
});
