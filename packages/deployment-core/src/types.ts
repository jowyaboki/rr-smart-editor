// Core Models for Enterprise Deployment Platform
export type DeploymentMode =
  | 'development'
  | 'production'
  | 'desktop'
  | 'self_hosted'
  | 'docker'
  | 'docker_compose'
  | 'kubernetes'
  | 'cloud'
  | 'edge'
  | 'offline';

export interface AppConfig {
  mode: DeploymentMode;
  port: number;
  databaseUrl: string;
  storage: {
    provider: 'local' | 's3' | 'azure' | 'gcp' | 'nas';
    bucketName: string;
    endpoint?: string;
  };
  features: {
    aiCreativeStudio: boolean;
    distributedRendering: boolean;
    collaborationEngine: boolean;
  };
}

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';

export interface DependencyStatus {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  details?: string;
}

export interface HealthReport {
  status: HealthStatus;
  version: string;
  mode: DeploymentMode;
  uptimeSec: number;
  dependencies: {
    database: DependencyStatus;
    storage: DependencyStatus;
    queue: DependencyStatus;
    workers: DependencyStatus;
  };
  timestamp: string;
}

export interface Secret {
  key: string;
  value: string;
  provider: 'env' | 'encrypted_file' | 'vault' | 'aws_secrets' | string;
  version: number;
  rotatedAt: string;
}

export interface DatabaseMigration {
  id: string;
  name: string;
  appliedAt: string;
  batch: number;
}

export interface BackupMetadata {
  id: string;
  type: 'project' | 'asset' | 'workspace' | 'incremental';
  createdAt: string;
  sizeBytes: number;
  checksum: string;
  manifest: string[];
}

export type LicenseEdition = 'community' | 'professional' | 'enterprise';

export interface LicenseInfo {
  key: string;
  edition: LicenseEdition;
  owner: string;
  issuedAt: string;
  expiresAt: string;
  status: 'valid' | 'expired' | 'revoked' | 'invalid';
  maxFloatingWorkers?: number;
  offlineAllowed: boolean;
}

// Service Interfaces
export interface ISecretsService {
  getSecret: (key: string) => Promise<string>;
  setSecret: (key: string, value: string, provider?: string) => Promise<void>;
  rotateSecret: (key: string) => Promise<Secret>;
}

export interface IMigrationService {
  getAppliedMigrations: () => Promise<DatabaseMigration[]>;
  migrateUp: () => Promise<DatabaseMigration[]>;
  rollbackLastBatch: () => Promise<DatabaseMigration[]>;
}

export interface IBackupService {
  createBackup: (type: BackupMetadata['type']) => Promise<BackupMetadata>;
  restoreBackup: (backupId: string) => Promise<boolean>;
  listBackups: () => Promise<BackupMetadata[]>;
}

export interface IHealthService {
  getLiveness: () => Promise<{ status: HealthStatus }>;
  getReadiness: () => Promise<HealthReport>;
}

export interface ILicenseService {
  validateLicense: (licenseKey: string) => Promise<LicenseInfo>;
  getActiveLicense: () => Promise<LicenseInfo | null>;
  activateOfflineLicense: (offlineToken: string) => Promise<LicenseInfo>;
}
