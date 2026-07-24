import { DeploymentService } from './services/DeploymentService';
import { ConfigurationService } from './services/ConfigurationService';
import { SecretsService } from './services/SecretsService';
import { MigrationService } from './services/MigrationService';
import { BackupService } from './services/BackupService';
import { HealthService } from './services/HealthService';
import { LicenseService } from './services/LicenseService';
import {
  DeploymentMode,
  AppConfig,
  HealthStatus,
  DependencyStatus,
  HealthReport,
  Secret,
  DatabaseMigration,
  BackupMetadata,
  LicenseEdition,
  LicenseInfo,
} from './types';

export * from './types';
export * from './services/DeploymentService';
export * from './services/ConfigurationService';
export * from './services/SecretsService';
export * from './services/MigrationService';
export * from './services/BackupService';
export * from './services/HealthService';
export * from './services/LicenseService';

export class DeploymentPlatformEngine {
  public deploymentService: DeploymentService;
  public configurationService: ConfigurationService;
  public secretsService: SecretsService;
  public migrationService: MigrationService;
  public backupService: BackupService;
  public healthService: HealthService;
  public licenseService: LicenseService;

  constructor(initialMode: DeploymentMode = 'development') {
    this.deploymentService = new DeploymentService();
    this.configurationService = new ConfigurationService(initialMode);
    this.secretsService = new SecretsService();
    this.migrationService = new MigrationService();
    this.backupService = new BackupService();
    this.healthService = new HealthService(initialMode);
    this.licenseService = new LicenseService();
  }
}

export const globalDeploymentPlatformEngine = new DeploymentPlatformEngine();
