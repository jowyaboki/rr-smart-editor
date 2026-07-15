import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { ExtensionRegistry } from '../registry/ExtensionRegistry.ts';
import { PluginManagerService } from '../services/PluginManagerService.ts';
import { ExtensionPlugin, PluginContext } from '../../../../../packages/plugin-sdk/src/index.ts';

describe('Plugin SDK & Extension Runtime Tests', () => {
  const mockManifest = {
    id: 'test_plugin_a',
    name: 'Advanced Waveform Analyzer',
    version: '1.2.0',
    author: 'Acoustic Labs',
    description: 'Profiles sound levels and automatically structures subtitle cues.',
    homepage: 'https://acoustic-labs.com',
    engineVersion: '>=1.0.0',
    permissions: ['filesystem', 'ai'],
    entry: 'index.js',
  };

  beforeEach(() => {
    ExtensionRegistry.clear();
  });

  test('PluginManifest & Discovery - validates manifests parameters', () => {
    // 1. Valid manifest check
    assert.strictEqual(PluginManagerService.validateManifest(mockManifest), true);

    // 2. Invalid manifest check
    const corruptManifest = { id: 'bad_plugin', version: '1.0' };
    assert.strictEqual(PluginManagerService.validateManifest(corruptManifest), false);
  });

  test('PluginContext & Sandbox - executes secure commands, panels, and permissions checking', () => {
    let triggeredEventCount = 0;
    let registeredCommandExecuted = false;

    const mockPluginInstance: ExtensionPlugin = {
      install: (context: PluginContext) => {
        // Subscribe to standard event bus channel
        context.eventBus.subscribe('sound_threshold_breached', (data: any) => {
          triggeredEventCount += data.dB;
        });

        // Register custom command
        context.commands.register({
          id: 'cmd_acoustic_profile',
          title: 'Calculate spectral wave peaks',
          execute: () => {
            registeredCommandExecuted = true;
          },
        });

        // Register custom sidebar panel
        context.ui.registerSidebarPanel('panel_acoustic_waveform', {
          label: 'Waveform Spectrum',
          icon: 'BarChart',
          component: 'MockReactComponent',
        });
      },
      uninstall: () => {
        // Cleanup logs
      },
    };

    // Load plugin
    PluginManagerService.loadPlugin(mockManifest, mockPluginInstance);

    // 1. Verify registered permissions are intact
    assert.strictEqual(ExtensionRegistry.verifyPermission('test_plugin_a', 'filesystem'), true);
    assert.strictEqual(ExtensionRegistry.verifyPermission('test_plugin_a', 'ai'), true);
    assert.strictEqual(ExtensionRegistry.verifyPermission('test_plugin_a', 'network'), false); // rejected!

    // 2. Check panel registry
    const panels = ExtensionRegistry.getAllSidebarPanels();
    assert.strictEqual(panels.length, 1);
    assert.strictEqual(panels[0].label, 'Waveform Spectrum');

    // 3. Check command registration and execution
    ExtensionRegistry.executeCommand('cmd_acoustic_profile');
    assert.strictEqual(registeredCommandExecuted, true);

    // 4. Clean unload of the plugin
    PluginManagerService.unloadPlugin('test_plugin_a');
    assert.strictEqual(ExtensionRegistry.getAllSidebarPanels().length, 0);
    assert.strictEqual(ExtensionRegistry.getAllCommands().length, 0);
  });
});
