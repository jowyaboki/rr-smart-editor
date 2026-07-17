import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  MediaImportService,
  AnalysisService,
  TranscodingService,
  ProxyService,
  ThumbnailService,
  WaveformService,
  MediaAsset,
} from '../src/index';

describe('Media Ingest and Proxy Pipeline Core Unit Tests', () => {

  test('Fingerprint Generation & Duplicate Detection', () => {
    MediaImportService.clear();

    const filename = 'b_roll_ocean.mp4';
    const size = 1024 * 1024 * 15; // 15 MB
    const path = '/local/movies/b_roll_ocean.mp4';

    // 1. Generate unique checksum fingerprint
    const fingerprint1 = MediaImportService.generateFingerprint(filename, size);
    const fingerprint2 = MediaImportService.generateFingerprint(filename, size);

    assert.strictEqual(fingerprint1, fingerprint2); // same attributes produce same fingerprint
    assert.ok(fingerprint1.startsWith('hash_'));

    // Check for non-matching file attributes
    const diffFingerprint = MediaImportService.generateFingerprint('audio_scenery.mp3', size);
    assert.notStrictEqual(fingerprint1, diffFingerprint);

    // 2. Create import job
    const job = MediaImportService.createImportJob(filename, size, path);
    assert.strictEqual(job.filename, filename);
    assert.strictEqual(job.status, 'queued');

    // Simulate complete asset registration in index
    const asset: MediaAsset = {
      id: job.assetId,
      filename,
      filepath: path,
      type: 'video',
      size,
      fingerprint: fingerprint1,
      metadata: { checksum: fingerprint1, resolution: { width: 1920, height: 1080 }, duration: 15.0 },
    };

    MediaImportService.registerAsset(asset);

    // 3. Trying to create a duplicate import job with same attributes must fail!
    assert.throws(() => {
      MediaImportService.createImportJob(filename, size, path);
    }, /Duplicate asset detected/);
  });

  test('Analysis Service Metadata Extraction', () => {
    const hash = 'hash_12345';

    // Video extraction profile
    const videoMeta = AnalysisService.analyzeMedia('/footages/vlog.mp4', 'vlog.mp4', 1024, hash);
    assert.strictEqual(videoMeta.checksum, hash);
    assert.deepStrictEqual(videoMeta.resolution, { width: 1920, height: 1080 });
    assert.strictEqual(videoMeta.fps, 30);
    assert.strictEqual(videoMeta.codec, 'h264');
    assert.strictEqual(videoMeta.audioChannels, 2);

    // Audio extraction profile
    const audioMeta = AnalysisService.analyzeMedia('/music/voiceover.mp3', 'voiceover.mp3', 1024, hash);
    assert.strictEqual(audioMeta.duration, 180.0);
    assert.strictEqual(audioMeta.codec, 'mp3');
    assert.strictEqual(audioMeta.audioChannels, 2);
  });

  test('Proxy, Poster thumbnail and Waveform Generations', async () => {
    const assetId = 'asset_mock_99';
    const path = '/footages/vacation.mp4';

    // 1. Proxy generation
    const lowProxy = await ProxyService.generateProxy(assetId, 'low', path);
    assert.strictEqual(lowProxy.assetId, assetId);
    assert.strictEqual(lowProxy.quality, 'low');
    assert.strictEqual(lowProxy.status, 'completed');
    assert.ok(lowProxy.filepath.includes('_proxy_low.mp4'));

    // 2. Thumbnail poster extraction
    const thumbnail = await ThumbnailService.generateThumbnail(assetId, path, 5.0);
    assert.strictEqual(thumbnail.assetId, assetId);
    assert.strictEqual(thumbnail.posterFrameOffsetSec, 5.0);
    assert.ok(thumbnail.filepath.endsWith('_thumb.jpg'));

    // 3. Audio waveform peaks generation
    const waveform = await WaveformService.generateWaveform(assetId, path);
    assert.strictEqual(waveform.assetId, assetId);
    assert.strictEqual(waveform.peaks.length, 100); // 100 frequency bands peaks
    assert.strictEqual(waveform.channels, 2);
  });

  test('Queue Jobs state update management', () => {
    MediaImportService.clear();

    const job = MediaImportService.createImportJob('sea.mov', 1024 * 1024 * 5, '/local/sea.mov');
    assert.strictEqual(job.status, 'queued');

    // Update to processing
    const processing = MediaImportService.updateJob(job.id, 'processing', 40);
    assert.strictEqual(processing.status, 'processing');
    assert.strictEqual(processing.progress, 40);

    // Cancel job
    const cancelled = MediaImportService.updateJob(job.id, 'cancelled', 0);
    assert.strictEqual(cancelled.status, 'cancelled');
  });
});
