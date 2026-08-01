import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  PackageManager,
} from '../src/index';

describe('Developer Experience Lifecycle Certification (Phase 1)', () => {

  test('Create, Package, Validate, Sign, Publish, Install, Update, Rollback, Uninstall', async () => {
    const manager = new PackageManager();

    // 1. CREATE: Developer designs third-party plugin manifest
    const thirdPartyPluginManifest = {
      id: 'ext-hdr-denoise',
      name: 'hdr-denoise-plugin',
      displayName: 'HDR Temporal De-noise',
      description: 'Advanced temporal denoising filter for high dynamic range frames.',
      version: '1.0.0',
      author: 'VFX Labs Inc.',
      category: 'plugin' as const,
      tags: ['denoise', 'vfx'],
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      permissions: ['rendering' as const],
      activationEvents: [],
      entry: 'dist/hdr_denoise.js',
    };

    // 2. BUILD: Build code contents
    const sampleCode = 'console.log("HDR De-noise operational...");';

    // 3. VALIDATE & SIGN: Ensure manifest is compliant and sign
    const signResult = manager.signExtension(thirdPartyPluginManifest);
    assert.strictEqual(signResult, 'sha256-verified-ext-hdr-denoise');
    assert.strictEqual(thirdPartyPluginManifest.signature, 'sha256-verified-ext-hdr-denoise');

    const validationResult = await manager.validateExtension(thirdPartyPluginManifest);
    assert.strictEqual(validationResult.valid, true);

    // 4. PACKAGE: Pack into standardized zip structure
    const archivePayload = await manager.packageExtension(thirdPartyPluginManifest);
    assert.ok(archivePayload.includes('hdr-denoise-plugin'));

    // 5. PUBLISH: Register on the marketplace
    manager.publishExtension(thirdPartyPluginManifest);

    // 6. INSTALL: Client downloads and installs from marketplace offline
    const installedPkg = await manager.installPackage(thirdPartyPluginManifest, async () => true);
    assert.strictEqual(installedPkg.manifest.id, 'ext-hdr-denoise');
    assert.strictEqual(installedPkg.manifest.version, '1.0.0');

    // 7. UPDATE: Developer publishes 1.1.0 update, client updates
    const updatedManifest = {
      ...thirdPartyPluginManifest,
      version: '1.1.0',
      description: 'Temporal denoising with ACEScg optimization.',
    };
    manager.signExtension(updatedManifest);
    manager.publishExtension(updatedManifest);

    const upgradedPkg = await manager.updatePackage(updatedManifest, async () => true);
    assert.strictEqual(upgradedPkg.manifest.version, '1.1.0');

    // 8. ROLLBACK: Client rolls back to previous version 1.0.0
    const rolledBackPkg = manager.rollbackPackage('ext-hdr-denoise');
    assert.strictEqual(rolledBackPkg.manifest.version, '1.0.0');

    // 9. UNINSTALL: Client uninstalls plugin completely
    manager.uninstallPackage('ext-hdr-denoise');
    assert.strictEqual(manager.getInstalledPackage('ext-hdr-denoise'), undefined);
  });
});
