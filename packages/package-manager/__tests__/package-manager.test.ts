import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  PackageManager,
  DependencyResolver,
  PermissionManager,
  ValidationService,
} from '../src/index';

describe('Package Manager & Extension SDK Core Unit Tests', () => {

  test('Manifest Schemas Validation and Signature Verification', () => {
    const valService = new ValidationService();

    const badManifest = {
      id: 'bad-ext',
      name: 'broken-package',
      displayName: 'Broken Package',
      description: 'Missing fields',
      // version missing
      author: 'Unknown',
      category: 'plugin',
      permissions: [],
      activationEvents: [],
      entry: 'main.js',
    };

    // 1. Zod parse should catch missing fields
    const validation = valService.validateManifest(badManifest);
    assert.strictEqual(validation.valid, false);

    const goodManifest = {
      id: 'good-ext',
      name: 'clean-package',
      displayName: 'Clean Package',
      description: 'Fully valid package manifest structure.',
      version: '1.0.0',
      author: 'Developer',
      category: 'plugin' as const,
      tags: ['helper'],
      editorVersion: '>=1.0.0',
      engineVersion: '>=1.0.0',
      permissions: ['network' as const],
      activationEvents: ['onStartup'],
      entry: 'dist/bundle.js',
      signature: 'sha256-verified-good-ext',
    };

    // 2. Validate successfully with registered valid digital signature
    const goodValidation = valService.validateManifest(goodManifest);
    assert.strictEqual(goodValidation.valid, true);
  });

  test('Topological Dependency Resolution & Version Compatibility Solver', () => {
    const resolver = new DependencyResolver();

    // 1. Set up dependency structure: A -> B -> C
    const allPackages = {
      extA: { id: 'extA', version: '1.0.0', dependencies: { extB: '^1.0.0' } },
      extB: { id: 'extB', version: '1.2.0', dependencies: { extC: '^1.0.0' } },
      extC: { id: 'extC', version: '1.0.1', dependencies: {} },
    };

    const sortedOrder = resolver.resolve([allPackages.extA], allPackages);
    // Correct topological order from leaf to root: extC -> extB -> extA
    assert.deepStrictEqual(sortedOrder, ['extC', 'extB', 'extA']);

    // 2. Cyclic dependency detection
    const cyclicPackages = {
      extA: { id: 'extA', version: '1.0.0', dependencies: { extB: '^1.0.0' } },
      extB: { id: 'extB', version: '1.0.0', dependencies: { extA: '^1.0.0' } },
    };

    assert.throws(() => {
      resolver.resolve([cyclicPackages.extA], cyclicPackages);
    }, /Circular dependency/);

    // 3. Semver compatibility validation solver
    assert.strictEqual(resolver.isCompatible('1.2.3', '^1.0.0'), true);
    assert.strictEqual(resolver.isCompatible('2.0.1', '^1.0.0'), false);
  });

  test('Extension Lifecycle Upgrades, Rollbacks and Repairs', async () => {
    const manager = new PackageManager();

    const manifestV1 = {
      id: 'ext-anim',
      name: 'anim-pack',
      displayName: 'Animations Pack',
      description: 'Version 1.0.0',
      version: '1.0.0',
      author: 'RR Studio',
      category: 'plugin' as const,
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      permissions: ['filesystem' as const],
      activationEvents: [],
      entry: 'bundle.js',
      signature: 'sha256-verified-ext-anim',
    };

    // 1. Install & Enable V1
    const pkgV1 = await manager.installPackage(manifestV1, async () => true);
    assert.strictEqual(pkgV1.manifest.version, '1.0.0');

    manager.enablePackage('ext-anim');
    assert.strictEqual(manager.getInstalledPackage('ext-anim')?.status, 'active');

    // 2. Upgrade to V2
    const manifestV2 = { ...manifestV1, version: '2.0.0', description: 'Version 2.0.0' };
    const pkgV2 = await manager.updatePackage(manifestV2, async () => true);
    assert.strictEqual(pkgV2.manifest.version, '2.0.0');

    // 3. Rollback to V1
    const rolledBack = manager.rollbackPackage('ext-anim');
    assert.strictEqual(rolledBack.manifest.version, '1.0.0');

    // 4. Uninstall package completely
    manager.uninstallPackage('ext-anim');
    assert.strictEqual(manager.getInstalledPackage('ext-anim'), undefined);
  });
});
