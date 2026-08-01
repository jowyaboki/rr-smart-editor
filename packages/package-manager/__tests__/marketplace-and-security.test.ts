import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  PackageManager,
} from '../src/index';

describe('Marketplace & Security Complete Certification (Phase 3 & 4)', () => {

  test('Digital Signatures and manifest modification rejection', async () => {
    const manager = new PackageManager();

    const normalManifest = {
      id: 'ext-3',
      name: 'ext-3',
      displayName: 'Normal Plugin',
      description: 'Standard plugin',
      version: '1.0.0',
      author: 'RR Studio',
      category: 'plugin' as const,
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      permissions: ['network' as const],
      activationEvents: [],
      entry: 'index.js',
    };

    // 1. Missing signature rejection
    await assert.rejects(async () => {
      await manager.installPackage(normalManifest, async () => true);
    }, /unverified publisher signature/);

    // 2. Modified manifest or invalid signature check
    const badManifest = { ...normalManifest, signature: 'sha256-invalid-sig' };
    await assert.rejects(async () => {
      await manager.installPackage(badManifest, async () => true);
    }, /unverified publisher signature/);

    // 3. Valid signature acceptance
    manager.signExtension(normalManifest);
    const installed = await manager.installPackage(normalManifest, async () => true);
    assert.strictEqual(installed.manifest.id, 'ext-3');
  });

  test('Malicious Content Scanning and Sandbox Boundary protection', () => {
    const manager = new PackageManager();

    const secureManifest = {
      id: 'secure-extension',
      name: 'secure-extension',
      displayName: 'Secure Extension',
      description: 'Runs safely within the sandbox.',
      version: '1.0.0',
      author: 'Dev',
      category: 'plugin' as const,
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      permissions: ['network' as const],
      activationEvents: [],
      entry: 'main.js',
      signature: 'sha256-verified-secure-extension',
    };

    // Audit containing blocklisted keywords
    const audit1 = manager.validator.auditPackage(secureManifest, 'const shelljs = require("shelljs");');
    assert.strictEqual(audit1.passed, false);
    assert.ok(audit1.issues.some(i => i.includes('Malicious package detection')));

    // Audit containing no blocklisted content
    const audit2 = manager.validator.auditPackage(secureManifest, 'console.log("Safe code");');
    assert.strictEqual(audit2.passed, true);
  });

  test('Version Compatibility and Dependency conflicts solver', () => {
    const manager = new PackageManager();

    // Verify Semver checker
    assert.strictEqual(manager.resolver.isCompatible('1.2.3', '^1.0.0'), true);
    assert.strictEqual(manager.resolver.isCompatible('2.0.1', '^1.0.0'), false);

    // Verify circular dependency error handling
    const badTree = {
      extA: { id: 'extA', version: '1.0.0', dependencies: { extB: '1.0.0' } },
      extB: { id: 'extB', version: '1.0.0', dependencies: { extA: '1.0.0' } },
    };

    assert.throws(() => {
      manager.resolver.resolve([badTree.extA], badTree);
    }, /Circular dependency/);
  });
});
