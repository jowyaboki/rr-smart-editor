import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  AssetLibraryService,
  MetadataService,
  VersionService,
  ApprovalService,
  SearchService,
  RightsService,
  UsageService,
} from '../src/index';

describe('Enterprise DAM Platform Core Unit Tests', () => {

  test('Incremental versioning creation and restorations', () => {
    const asset: any = {
      id: 'dam-asset-1',
      name: 'Premium Intro.mp4',
      checksum: 'sha256-hash-v1',
      url: 'https://cdn.com/premium-intro-v1.mp4',
      metadata: { fileType: 'mp4' },
      versions: [
        { version: '1.0.0', checksum: 'sha256-hash-v1', size: 1024 * 10, url: 'https://cdn.com/premium-intro-v1.mp4', uploadedAt: Date.now() }
      ],
    };

    const versions = new VersionService();

    // 1. Create a newer version v2
    versions.createVersion(asset, {
      version: '2.0.0',
      checksum: 'sha256-hash-v2',
      size: 1024 * 15,
      url: 'https://cdn.com/premium-intro-v2.mp4',
      changelog: 'Branding updates',
    });

    assert.strictEqual(asset.checksum, 'sha256-hash-v2');
    assert.strictEqual(asset.url, 'https://cdn.com/premium-intro-v2.mp4');
    assert.strictEqual(asset.versions.length, 2);

    // 2. Restore legacy version v1
    versions.restoreVersion(asset, '1.0.0');
    assert.strictEqual(asset.checksum, 'sha256-hash-v1');
    assert.strictEqual(asset.url, 'https://cdn.com/premium-intro-v1.mp4');
  });

  test('Smart search query filters', () => {
    const search = new SearchService();

    const assets: any[] = [
      {
        id: 'asset-1',
        name: 'Vibrant Intro.mp4',
        metadata: {
          title: 'Vibrant Intro Explainer',
          description: 'Flat vector elements',
          keywords: ['promo', 'tech'],
          aiGeneratedTags: ['vector', 'motion'],
          fileType: 'mp4',
          codec: 'h264',
        },
      },
      {
        id: 'asset-2',
        name: 'Vocal Track.wav',
        metadata: {
          title: 'Studio Voiceover',
          description: 'Acapella speech',
          keywords: ['vocal', 'audio'],
          fileType: 'wav',
          codec: 'pcm',
        },
      }
    ];

    // 1. Search by textual queries matching keywords
    const res1 = search.search(assets, 'promo');
    assert.strictEqual(res1.length, 1);
    assert.strictEqual(res1[0].id, 'asset-1');

    // 2. Search filtering by file codec
    const res2 = search.search(assets, '', { codec: 'pcm' });
    assert.strictEqual(res2.length, 1);
    assert.strictEqual(res2[0].id, 'asset-2');
  });

  test('Rights licenses validations & Expirations', () => {
    const rights = new RightsService();

    // 1. Scenario: Good valid license
    const goodLicense = {
      licenseType: 'commercial',
      expirationDate: Date.now() + 1000 * 60 * 60, // 1 hour later
      attributionRequired: false,
      commercialUse: true,
      territory: 'US',
    };
    const check1 = rights.isAuthorized(goodLicense, 'US');
    assert.strictEqual(check1.authorized, true);

    // 2. Scenario: Expired license
    const expiredLicense = { ...goodLicense, expirationDate: Date.now() - 1000 };
    const check2 = rights.isAuthorized(expiredLicense, 'US');
    assert.strictEqual(check2.authorized, false);
    assert.strictEqual(check2.reason, 'LICENSE_EXPIRED');

    // 3. Scenario: Territorial limits check
    const check3 = rights.isAuthorized(goodLicense, 'EU'); // target US only
    assert.strictEqual(check3.authorized, false);
    assert.strictEqual(check3.reason, 'TERRITORIAL_RESTRICTION');
  });

  test('Approvals transitioning & workflow logs', () => {
    const asset: any = {
      id: 'asset-1',
      approval: {
        status: 'draft',
        reviewerComments: [],
        history: [],
      },
    };

    const approvals = new ApprovalService();

    approvals.transitionStatus(asset, 'in_review', 'Jules', 'Triggering code review.');
    assert.strictEqual(asset.approval.status, 'in_review');
    assert.strictEqual(asset.approval.reviewerComments[0], 'Triggering code review.');
    assert.strictEqual(asset.approval.history[0].reviewer, 'Jules');
  });
});
