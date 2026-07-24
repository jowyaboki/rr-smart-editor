import { describe, test } from 'node:test';
import assert from 'node:assert';
import { NativeDesktopPlatformEngine } from '@ai-video-editor/native-services';
import { Project } from '@ai-video-editor/shared';

describe('Native Desktop Platform Core Unit Tests', () => {

  test('Installation Bootstrap and Window registration', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const bootSuccess = await engine.desktopService.bootstrapPlatform();
    assert.strictEqual(bootSuccess, true);

    const windows = await engine.desktopService.listWindows();
    assert.strictEqual(windows.length, 2);
    assert.strictEqual(windows[0].id, 'win_main');
    assert.strictEqual(windows[0].isVisible, true);

    // Show window
    await engine.desktopService.showWindow('win_inspector');
    assert.strictEqual(windows[1].id, 'win_inspector');
    assert.strictEqual(windows[1].isVisible, true);
  });

  test('Local Filesystem WATCH folders & Local Caching', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const watch1 = await engine.fileSystemService.watchFolder('/user/workspace', true);
    assert.strictEqual(watch1, true);

    const watched = await engine.fileSystemService.listWatchedFolders();
    assert.strictEqual(watched.length, 1);
    assert.strictEqual(watched[0].path, '/user/workspace');

    // Local assets index search
    const results = await engine.fileSystemService.searchLocalAssets('sunset');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].filename, 'sunset.mp4');

    // Cache read/write
    await engine.fileSystemService.writeLocalCache('draft_autosave', 'test_data');
    const cache = await engine.fileSystemService.readLocalCache('draft_autosave');
    assert.strictEqual(cache, 'test_data');
  });

  test('GPU Hardware Acceleration Probes & fallback options', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const diag = await engine.gpuService.detectGPU();
    assert.strictEqual(diag.gpuEnabled, true);
    assert.strictEqual(diag.vendorName, 'NVIDIA Corporation');
    assert.strictEqual(diag.supportsHardwareAcceleration, true);

    const accel = await engine.gpuService.isHardwareAccelerated();
    assert.strictEqual(accel, true);

    // Disable GPU to test Fallback CPU options
    engine.gpuService.setMockDiagnostics({
      gpuEnabled: false,
      supportsHardwareAcceleration: false,
    });

    const diagFallback = await engine.gpuService.detectGPU();
    assert.strictEqual(diagFallback.gpuEnabled, false);
    assert.strictEqual(diagFallback.supportsHardwareAcceleration, false);
  });

  test('Local AI Offline-first generation (Ollama & local Whisper)', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const text = await engine.nativeAIService.generateTextLocal(
      { provider: 'ollama', endpoint: 'http://localhost:11434', modelName: 'llama3' },
      'Write a video editing script.'
    );
    assert.ok(text.includes('[Ollama - llama3]'));

    const transcript = await engine.nativeAIService.transcribeLocal(
      { provider: 'local_whisper', endpoint: '', modelName: 'whisper-base' },
      '/user/movies/audio.wav'
    );
    assert.ok(transcript.includes('Speech decoded locally'));
  });

  test('Auto Update checking & release channels', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const stableUpdate = await engine.updateService.checkForUpdates('stable');
    assert.ok(stableUpdate);
    assert.strictEqual(stableUpdate.version, '2.0.0');

    const nightlyUpdate = await engine.updateService.checkForUpdates('nightly');
    assert.ok(nightlyUpdate);
    assert.strictEqual(nightlyUpdate.version, '2.0.1-nightly');

    const installSuccess = await engine.updateService.downloadAndInstallUpdate(stableUpdate);
    assert.strictEqual(installSuccess, true);
  });

  test('Automatic Crash Recovery & Safe Mode dumps', async () => {
    const engine = new NativeDesktopPlatformEngine();

    const mockProject: Project = {
      id: 'proj_crash_test',
      name: 'Corrupted sundance project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: {},
    };

    // Save auto-recovery dump
    await engine.crashRecoveryService.saveAutoRecoverState(mockProject);
    const recovered = await engine.crashRecoveryService.getAutoRecoverState('proj_crash_test');
    assert.ok(recovered);
    assert.strictEqual(recovered.name, 'Corrupted sundance project');

    // Trigger safe mode
    await engine.crashRecoveryService.enterSafeMode();
    assert.strictEqual((engine.crashRecoveryService as any).isSafeMode(), true);
  });
});
