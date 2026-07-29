import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  globalMediaManagementPlatformEngine,
  globalMediaManagementPluginRegistry,
  MediaAsset,
  MetadataExtractorPlugin,
} from '../src/index';

describe('Enterprise Media Asset Management (MAM/DAM) Core Unit Tests', () => {
  const mockAsset: MediaAsset = {
    id: 'asset_broadway_01',
    name: 'Broadway_Scene_01.mp4',
    url: '/uploads/assets/Broadway_Scene_01.mp4',
    checksum: 'checksum_broadway_999',
    folderId: 'folder_raw',
    technicalMetadata: {
      size: 1024 * 1024 * 15,
      mimeType: 'video/mp4',
    },
    metadata: {
      id: 'meta_broadway_01',
      name: 'Broadway Scene Metadata Profile',
      aiGeneratedTags: ['broadway', 'lights', 'musical'],
    },
    currentVersionNumber: 1,
    versions: [
      {
        id: 'ver_asset_broadway_01_v1',
        assetId: 'asset_broadway_01',
        versionNumber: 1,
        url: '/uploads/assets/Broadway_Scene_01.mp4',
        size: 1024 * 1024 * 15,
        checksum: 'checksum_broadway_999',
        createdBy: 'Jules',
        createdAt: new Date().toISOString(),
      },
    ],
    lifecycleState: 'online',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test('Catalog Service successfully registers and catalogs new assets', () => {
    const engine = globalMediaManagementPlatformEngine;
    engine.catalogService.registerAsset(mockAsset);

    const retrieved = engine.catalogService.getAsset(mockAsset.id);
    assert.strictEqual(retrieved?.name, 'Broadway_Scene_01.mp4');
    assert.strictEqual(retrieved?.currentVersionNumber, 1);

    // Duplicate detection check
    assert.throws(() => {
      engine.catalogService.registerAsset(mockAsset);
    }, /Duplicate asset detected/);
  });

  test('Metadata Service extraction and tag inheritance from parent folders', async () => {
    const engine = globalMediaManagementPlatformEngine;

    const parentFolder = {
      id: 'folder_inherited_tag',
      name: 'Cinematic Folders',
      inheritedMetadata: {
        id: 'meta_folder_inher',
        name: 'Folder Profile',
        aiGeneratedTags: ['cinema', 'inherited_tag'],
        customMetadata: { productionRating: 'high' },
      },
      createdAt: new Date().toISOString(),
    };

    const compiled = await engine.metadataService.compileMetadataProfile(
      '/uploads/assets/Scene_new.mp4',
      parentFolder,
      { authorName: 'Admin' }
    );

    assert.ok(compiled.aiGeneratedTags?.includes('cinema'));
    assert.ok(compiled.aiGeneratedTags?.includes('inherited_tag'));
    assert.strictEqual(compiled.customMetadata?.productionRating, 'high');
    assert.strictEqual(compiled.customMetadata?.authorName, 'Admin');
  });

  test('Version Service handles histories, compares and restores active states', () => {
    const engine = globalMediaManagementPlatformEngine;
    const activeAsset = engine.catalogService.getAsset(mockAsset.id)!;

    // Create v2 version
    engine.versionService.createNewVersion(
      activeAsset,
      '/uploads/assets/Broadway_Scene_01_updated.mp4',
      1024 * 1024 * 18,
      'checksum_broadway_999_v2',
      'Jules',
      'Color graded master b-roll footage.'
    );

    assert.strictEqual(activeAsset.currentVersionNumber, 2);
    assert.strictEqual(activeAsset.versions.length, 2);
    assert.strictEqual(activeAsset.url, '/uploads/assets/Broadway_Scene_01_updated.mp4');

    // Restore v1 state
    engine.versionService.restoreVersion(activeAsset, 1);
    assert.strictEqual(activeAsset.currentVersionNumber, 1);
    assert.strictEqual(activeAsset.url, '/uploads/assets/Broadway_Scene_01.mp4');
  });

  test('Rights Management validation and expiration/territory reviews', async () => {
    const engine = globalMediaManagementPlatformEngine;
    const activeAsset = engine.catalogService.getAsset(mockAsset.id)!;

    engine.rightsService.assignLicense(activeAsset, {
      id: 'lic_CC_BY_01',
      type: 'CC-BY',
      owner: 'Creative Commons Corp',
      allowedTerritories: ['US', 'EU'],
      expirationDate: '2030-12-31T00:00:00.000Z',
    });

    const isUSCleared = await engine.rightsService.validateTerritoryUsage(activeAsset, 'US');
    assert.strictEqual(isUSCleared.cleared, true);

    const isEUPCleared = await engine.rightsService.validateTerritoryUsage(activeAsset, 'EU');
    assert.strictEqual(isEUPCleared.cleared, true);

    const isAPACCleared = await engine.rightsService.validateTerritoryUsage(activeAsset, 'JP');
    assert.strictEqual(isAPACCleared.cleared, false);
    assert.ok(isAPACCleared.reason?.includes('Territorial restriction'));
  });

  test('Approval workflow cycles (review -> approved/rejected)', () => {
    const engine = globalMediaManagementPlatformEngine;
    const activeAsset = engine.catalogService.getAsset(mockAsset.id)!;

    const req = engine.approvalService.submitForApproval(
      activeAsset,
      'ver_asset_broadway_01_v1',
      'Jules',
      ['Lead_Approver_Corp']
    );

    assert.strictEqual(req.currentStatus, 'review');

    // Approve the review cycle
    const updatedReq = engine.approvalService.recordReviewVote(
      req.id,
      'Lead_Approver_Corp',
      'approve',
      'Excellent camera work, cleared for publishing.'
    );

    assert.strictEqual(updatedReq.currentStatus, 'approved');
  });

  test('Archive policies and lifecycle storage migrations (online -> nearline -> cold)', async () => {
    const engine = globalMediaManagementPlatformEngine;
    const activeAsset = engine.catalogService.getAsset(mockAsset.id)!;

    assert.strictEqual(activeAsset.lifecycleState, 'online');

    // Shift tier to cold storage archive
    await engine.archiveService.migrateStorageTier(activeAsset, 'cold');
    assert.strictEqual(activeAsset.lifecycleState, 'cold');
    assert.ok(activeAsset.url.endsWith('_archived'));

    // Restore request tier shift
    await engine.archiveService.migrateStorageTier(activeAsset, 'online');
    assert.strictEqual(activeAsset.lifecycleState, 'online');
    assert.ok(!activeAsset.url.endsWith('_archived'));
  });

  test('MAM/DAM dynamic plugin registry integrations', async () => {
    const extractor: MetadataExtractorPlugin = {
      id: 'plug_exif_ext',
      name: 'Sony Raw Camera Extractor',
      supportedMimeTypes: ['video/mp4'],
      async extract(url) {
        return { cameraFirmwareVersion: 'v2.01' };
      },
    };

    globalMediaManagementPluginRegistry.registerMetadataExtractor(extractor);

    const engine = globalMediaManagementPlatformEngine;
    const compiled = await engine.metadataService.compileMetadataProfile('/uploads/Sony_raw.mp4');

    assert.strictEqual(compiled.customMetadata?.cameraFirmwareVersion, 'v2.01');
  });
});
