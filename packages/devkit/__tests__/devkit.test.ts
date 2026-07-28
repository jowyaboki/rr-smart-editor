import { describe, test } from 'node:test';
import assert from 'node:assert';
import { globalDevKitPlatformEngine, ManifestSchema, DevKitValidator } from '../src/index';
import { globalCLIService } from '@ai-video-editor/cli';
import { PluginTestHarness } from '@ai-video-editor/testing-sdk';

describe('Developer Platform SDK Core Unit Tests', () => {

  test('Template Project Generation - Boilerplates', async () => {
    const engine = globalDevKitPlatformEngine;

    const genPlugin = await engine.generatorService.generateProject({
      name: 'SmartCaption',
      type: 'plugin',
      description: 'Generates subtitle frames',
      author: 'AIEngineer',
      outputDirectory: './packages',
    });

    assert.strictEqual(genPlugin.success, true);
    assert.ok(genPlugin.boilerplateCode.includes('SmartCaptionPlugin'));
    assert.strictEqual(genPlugin.manifestFiles.length, 5);

    const genAgent = await engine.generatorService.generateProject({
      name: 'MontageCreator',
      type: 'ai_agent',
      description: 'Slices sizzle reels',
      author: 'AIEngineer',
      outputDirectory: './packages',
    });

    assert.strictEqual(genAgent.success, true);
    assert.ok(genAgent.boilerplateCode.includes('MontageCreatorAgent'));
  });

  test('Manifest schema validations & permission checks', async () => {
    const engine = globalDevKitPlatformEngine;

    // 1. Fully valid manifest
    const goodManifest: ManifestSchema = {
      id: 'smart_effect_pro',
      name: 'Smart Effect Pro',
      version: '1.2.0',
      entrypoint: 'src/index.ts',
      permissions: ['filesystem_read', 'ai_assistant'],
      dependencies: {
        'typescript': '^5.0.0',
      },
      compatibility: {
        minEditorVersion: '1.0.0',
        targetNodeVersion: '18.x',
      },
    };

    const resGood = await engine.validationService.validateManifest(goodManifest);
    assert.strictEqual(resGood.isValid, true);
    assert.strictEqual(resGood.errors.length, 0);

    // 2. Dangerous unauthorized permission check
    const badManifest: ManifestSchema = {
      ...goodManifest,
      permissions: ['filesystem_write', 'dangerous_raw_eval_execution'], // Unsafe/unauthorized permission
    };

    const resBad = await engine.validationService.validateManifest(badManifest);
    assert.strictEqual(resBad.isValid, false);
    assert.ok(resBad.errors.some(e => e.message.includes('dangerous_raw_eval_execution')));

    // 3. Register a custom plugin validator
    const customValidator: DevKitValidator = {
      id: 'custom_check',
      name: 'Custom Check',
      validate: async (man) => {
        if (man.id === 'smart_effect_pro') {
          return { isValid: false, errors: [{ field: 'id', message: 'Test custom block', severity: 'error' }] };
        }
        return { isValid: true, errors: [] };
      },
    };
    engine.validationService.registerValidator(customValidator);
    const resCustom = await engine.validationService.validateManifest(goodManifest);
    assert.strictEqual(resCustom.isValid, false);
  });

  test('Automated SDK Reference Documentation generation', async () => {
    const engine = globalDevKitPlatformEngine;

    const docs = await engine.documentationService.generateDocs(
      'Plugin SDK Reference',
      'sdk_docs',
      ['Plugin registration lifecycle', 'Zustand stores binding', 'Timeline IPC handlers']
    );

    assert.strictEqual(docs.title, 'Plugin SDK Reference');
    assert.strictEqual(docs.category, 'sdk_docs');
    assert.strictEqual(docs.pagesCount, 3);
    assert.ok(docs.sections[0].content.includes('lifecycles'));
  });

  test('Testing SDK - Plugin development test harness integrations', async () => {
    const harness = new PluginTestHarness();

    const mockPlugin = {
      register: (editor: any) => {
        editor.timeline.moveClip('mock_clip_1', 100);
      },
    };

    const success = await harness.loadPlugin(mockPlugin);
    assert.strictEqual(success, true);
    assert.strictEqual(harness.isPluginActivated(), true);

    // Assert that clip was moved on the mock editor timeline by the plugin!
    const clips = harness.editor.timeline.getClips();
    assert.strictEqual(clips[0].startFrame, 100);
  });

  test('CLI Service Command Mapping executions', async () => {
    // Check doctor diagnosis
    const docRes = await globalCLIService.executeCommand('doctor');
    assert.strictEqual(docRes.success, true);
    assert.ok(docRes.output.includes('doctor diagnostics'));

    // Check project creation via CLI
    const createRes = await globalCLIService.executeCommand('create', ['VoiceSynthesizer', 'ai_agent']);
    assert.strictEqual(createRes.success, true);
    assert.ok(createRes.output.includes('created successfully'));
    assert.ok(createRes.metadata.boilerplateCode.includes('VoiceSynthesizerAgent'));

    // Check validate command
    const valRes = await globalCLIService.executeCommand('validate');
    assert.strictEqual(valRes.success, true);
    assert.ok(valRes.output.includes('validated'));

    // Check publish plugin
    const pubRes = await globalCLIService.executeCommand('publish-plugin', ['MyVoiceSynthesizer']);
    assert.strictEqual(pubRes.success, true);
    assert.ok(pubRes.output.includes('published successfully'));
  });
});
