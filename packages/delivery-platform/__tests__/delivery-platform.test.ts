import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalDeliveryPlatformEngine,
  globalDeliveryPluginRegistry,
  ExportPreset,
  ExporterAdapter,
} from '../src/index';
import { RenderArtifact } from '@ai-video-editor/shared';

describe('Professional Export, Delivery & Distribution Platform Tests', () => {
  const mockArtifact: RenderArtifact = {
    id: 'render_art_99',
    jobId: 'render_job_99',
    url: '/uploads/renders/render_art_99.mp4',
    format: 'mp4',
    size: 1024 * 1024 * 20, // 20 MB
    metadata: {
      duration: 10.0,
      resolution: { width: 1920, height: 1080 },
      codec: 'h264',
    },
    createdAt: new Date().toISOString(),
  };

  test('Preset Service loads default presets and resolves custom ones', () => {
    const presets = globalDeliveryPlatformEngine.presetService.listPresets();
    assert.ok(presets.length >= 3);

    const ytPreset = globalDeliveryPlatformEngine.presetService.getPreset('youtube_1080p');
    assert.strictEqual(ytPreset?.name, 'YouTube HD 1080p');
    assert.strictEqual(ytPreset?.format, 'mp4');
    assert.strictEqual(ytPreset?.encodingProfile.videoCodec, 'h264');
  });

  test('Quality Control validation rules - Success and Failure modes', async () => {
    // 1. All valid (normal rules)
    const validPreset = globalDeliveryPlatformEngine.presetService.getPreset('youtube_1080p')!;
    const report1 = await globalDeliveryPlatformEngine.validationService.validate(mockArtifact, validPreset.qcRules);
    assert.strictEqual(report1.isValid, true);
    assert.strictEqual(report1.score, 100);

    // 2. Failure simulated for missing assets, audio clipping, and frame drops
    const strictRules = [
      { id: 'rule_miss', type: 'missing_assets' as const, severity: 'error' as const, params: { simulateFail: true } },
      { id: 'rule_clip', type: 'audio_clipping' as const, severity: 'error' as const, params: { simulateClippingEvents: 5 } },
      { id: 'rule_drops', type: 'frame_drops' as const, severity: 'warning' as const, params: { maxAllowed: 2, simulateDrops: 10 } },
    ];

    const report2 = await globalDeliveryPlatformEngine.validationService.validate(mockArtifact, strictRules);
    assert.strictEqual(report2.isValid, false);
    assert.ok(report2.score < 60);
    assert.strictEqual(report2.violations.length, 3);
    assert.strictEqual(report2.metrics.missingAssets[0], 'asset_bg_music.mp3');
    assert.strictEqual(report2.metrics.frameDrops, 10);
  });

  test('Encoding Profiles & failure handling', async () => {
    const profile = {
      id: 'enc_test',
      name: 'H265 UHD Profile',
      videoCodec: 'h265' as const,
      videoBitrateKbps: 15000,
    };

    const res = await globalDeliveryPlatformEngine.encodingService.encode(mockArtifact.url, profile);
    assert.ok(res.outputPath.endsWith('_encoded.mp4'));
    assert.strictEqual(res.size, 15000 * 1024);

    // Test failure scenario
    const failingProfile = {
      id: 'enc_fail',
      name: 'Failing Profile',
      customSettings: { simulateFailure: 'Out of memory' },
    };

    await assert.rejects(async () => {
      await globalDeliveryPlatformEngine.encodingService.encode(mockArtifact.url, failingProfile);
    }, /Out of memory/);
  });

  test('Packaging layouts (HLS/MPEG-DASH/ZIP Archives)', async () => {
    const hlsProfile = {
      id: 'pkg_hls',
      name: 'HLS adaptive packager',
      format: 'hls' as const,
      segmentDurationSeconds: 6,
    };

    const hlsPkg = await globalDeliveryPlatformEngine.packagingService.package(mockArtifact.url, hlsProfile);
    assert.strictEqual(hlsPkg.format, 'hls');
    assert.ok(hlsPkg.files.length > 2);
    assert.ok(hlsPkg.files.some((f) => f.path.endsWith('.m3u8')));

    const zipProfile = {
      id: 'pkg_zip',
      name: 'Zip packager',
      format: 'zip_archive' as const,
    };

    const zipPkg = await globalDeliveryPlatformEngine.packagingService.package(mockArtifact.url, zipProfile);
    assert.strictEqual(zipPkg.format, 'zip_archive');
    assert.strictEqual(zipPkg.files[0].path, 'archive.zip');
  });

  test('Distribution & Upload progress tracking with Interrupted connection recovery', async () => {
    const mediaPkg = {
      id: 'pkg_test_1',
      manifestId: 'manifest_test_1',
      format: 'mp4',
      files: [{ path: 'render_art_99.mp4', size: 1024 * 1024 * 5, checksum: 'chk123' }],
      createdAt: new Date().toISOString(),
    };

    const destWithRetries = {
      id: 'dest_sftp_1',
      name: 'Main FTP/SFTP Server',
      type: 'ftp_sftp' as const,
      config: { simulateInterrupted: true }, // will fail once, then retry and succeed
      retryPolicy: { maxRetries: 2, delayMs: 5 },
    };

    const progressTracker: number[] = [];
    const uploadRes = await globalDeliveryPlatformEngine.distributionService.deliver(mediaPkg, destWithRetries, (task) => {
      progressTracker.push(task.progress);
    });

    assert.strictEqual(uploadRes.success, true);
    assert.strictEqual(progressTracker[progressTracker.length - 1], 100);
    assert.ok(progressTracker.length > 1);
  });

  test('Plugin system dynamic registration and custom Exporters', async () => {
    const mockExporter: ExporterAdapter = {
      id: 'plugin_gif_exporter',
      name: 'Fast GIF Plugin Exporter',
      supportedFormats: ['gif'],
      async export(artifact, format) {
        return {
          outputPath: '/plugins/exports/output.gif',
          size: 9999,
        };
      },
    };

    globalDeliveryPluginRegistry.registerExporter(mockExporter);

    // Call ExportService with gif and verify it routes through our registered plugin
    const expResult = await globalDeliveryPlatformEngine.exportService.export(mockArtifact, 'gif');
    assert.strictEqual(expResult.outputPath, '/plugins/exports/output.gif');
    assert.strictEqual(expResult.size, 9999);
  });

  test('Full concurrent pipeline coordination by DeliveryService', async () => {
    const project1 = 'project_alpha';
    const project2 = 'project_beta';

    const preset = globalDeliveryPlatformEngine.presetService.getPreset('youtube_1080p')!;

    // Trigger concurrent jobs
    const jobPromise1 = globalDeliveryPlatformEngine.deliveryService.submitJob(project1, mockArtifact, preset.id);
    const jobPromise2 = globalDeliveryPlatformEngine.deliveryService.submitJob(project2, mockArtifact, preset.id);

    const [job1, job2] = await Promise.all([jobPromise1, jobPromise2]);

    assert.strictEqual(job1.projectId, 'project_alpha');
    assert.strictEqual(job2.projectId, 'project_beta');

    // Wait short time to complete processing (since async and instant)
    await new Promise((r) => setTimeout(r, 80));

    const updatedJob1 = globalDeliveryPlatformEngine.deliveryService.getJob(job1.id);
    const updatedJob2 = globalDeliveryPlatformEngine.deliveryService.getJob(job2.id);

    assert.strictEqual(updatedJob1?.status, 'completed');
    assert.strictEqual(updatedJob2?.status, 'completed');
    assert.strictEqual(updatedJob1?.progress, 100);
    assert.strictEqual(updatedJob2?.progress, 100);

    const result1 = globalDeliveryPlatformEngine.deliveryService.getResult(job1.id);
    const result2 = globalDeliveryPlatformEngine.deliveryService.getResult(job2.id);

    assert.strictEqual(result1?.status, 'success');
    assert.strictEqual(result2?.status, 'success');
  });
});
