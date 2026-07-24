import { describe, test } from 'node:test';
import assert from 'node:assert';
import { DeploymentPlatformEngine } from '../src/index';

describe('Enterprise Deployment Platform Core Unit Tests', () => {

  test('Fresh installation & Bootstrapping across modes', async () => {
    const engine = new DeploymentPlatformEngine();

    const devBoot = await engine.deploymentService.bootstrap('development');
    assert.strictEqual(devBoot.success, true);
    assert.strictEqual(devBoot.mode, 'development');
    assert.ok(devBoot.bootstrappedServices.includes('ConfigurationService'));

    // Config hierarchical check
    const config = engine.configurationService.getConfig();
    assert.strictEqual(config.mode, 'development');
    assert.strictEqual(config.port, 3001);
  });

  test('Incremental Database Migrations - Upgrades & Downgrades', async () => {
    const engine = new DeploymentPlatformEngine();

    const appliedInit = await engine.migrationService.getAppliedMigrations();
    assert.strictEqual(appliedInit.length, 0);

    // Apply batch 1
    const appliedBatch1 = await engine.migrationService.migrateUp();
    assert.strictEqual(appliedBatch1.length, 3);
    assert.strictEqual(appliedBatch1[0].batch, 1);

    const appliedAfter = await engine.migrationService.getAppliedMigrations();
    assert.strictEqual(appliedAfter.length, 3);

    // Downgrade last batch
    const rolledBack = await engine.migrationService.rollbackLastBatch();
    assert.strictEqual(rolledBack.length, 3);
    assert.strictEqual((await engine.migrationService.getAppliedMigrations()).length, 0);
  });

  test('Project & Database Backup / Restorations', async () => {
    const engine = new DeploymentPlatformEngine();

    const backup = await engine.backupService.createBackup('workspace');
    assert.strictEqual(backup.type, 'workspace');
    assert.ok(backup.sizeBytes > 0);
    assert.strictEqual(backup.checksum, 'sha256_checksum_hash_enterprise_backup_123');

    const restoreSuccess = await engine.backupService.restoreBackup(backup.id);
    assert.strictEqual(restoreSuccess, true);

    const restoreFail = await engine.backupService.restoreBackup('invalid_backup_id');
    assert.strictEqual(restoreFail, false);
  });

  test('Secrets Rotation and Storage Providers', async () => {
    const engine = new DeploymentPlatformEngine();

    const val = await engine.secretsService.getSecret('JWT_SECRET');
    assert.strictEqual(val, 'dev_unsigned_jwt_secret_token_123');

    // Rotate
    const rotated = await engine.secretsService.rotateSecret('JWT_SECRET');
    assert.ok(rotated.value.includes('rotated'));
    assert.strictEqual(rotated.version, 2);

    const valAfter = await engine.secretsService.getSecret('JWT_SECRET');
    assert.strictEqual(valAfter, rotated.value);
  });

  test('Health Probes - Readiness, Liveness, and Dependency checks', async () => {
    const engine = new DeploymentPlatformEngine('production');

    const liveness = await engine.healthService.getLiveness();
    assert.strictEqual(liveness.status, 'healthy');

    const readiness = await engine.healthService.getReadiness();
    assert.strictEqual(readiness.status, 'healthy');
    assert.strictEqual(readiness.mode, 'production');
    assert.strictEqual(readiness.dependencies.database.name, 'Postgres RDS');
    assert.strictEqual(readiness.dependencies.database.status, 'healthy');
  });

  test('Licensing Abstractions - Community, Professional, Enterprise, and Offline', async () => {
    const engine = new DeploymentPlatformEngine();

    const active = await engine.licenseService.getActiveLicense();
    assert.ok(active);
    assert.strictEqual(active.edition, 'community');

    // Validate pro key
    const proInfo = await engine.licenseService.validateLicense('professional_token_999');
    assert.strictEqual(proInfo.edition, 'professional');
    assert.strictEqual(proInfo.offlineAllowed, false);

    // Validate enterprise key
    const entInfo = await engine.licenseService.validateLicense('enterprise_token_corporate');
    assert.strictEqual(entInfo.edition, 'enterprise');
    assert.strictEqual(entInfo.offlineAllowed, true);
    assert.strictEqual(entInfo.maxFloatingWorkers, 100);

    // Check expiration error
    const expiredInfo = await engine.licenseService.validateLicense('expired_key');
    assert.strictEqual(expiredInfo.status, 'expired');

    // Offline activation
    const offlineLic = await engine.licenseService.activateOfflineLicense('offline_token_string');
    assert.strictEqual(offlineLic.edition, 'enterprise');
    assert.strictEqual(offlineLic.offlineAllowed, true);
  });
});
