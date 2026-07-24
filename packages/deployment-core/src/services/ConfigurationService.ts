import { AppConfig, DeploymentMode } from '../types';

export class ConfigurationService {
  private currentConfig: AppConfig;

  constructor(initialMode: DeploymentMode = 'development') {
    this.currentConfig = this.loadConfig(initialMode);
  }

  public getConfig(): AppConfig {
    return this.currentConfig;
  }

  public updateConfig(overrides: Partial<AppConfig>): void {
    this.currentConfig = {
      ...this.currentConfig,
      ...overrides,
      features: {
        ...this.currentConfig.features,
        ...overrides.features,
      },
    };
  }

  private loadConfig(mode: DeploymentMode): AppConfig {
    // Standard default configuration
    const baseConfig: AppConfig = {
      mode,
      port: 3001,
      databaseUrl: 'postgresql://localhost:5432/smart_editor_dev',
      storage: {
        provider: 'local',
        bucketName: 'local-assets-bucket',
      },
      features: {
        aiCreativeStudio: true,
        distributedRendering: false,
        collaborationEngine: false,
      },
    };

    // Environmental hierarchical overrides
    if (mode === 'production') {
      baseConfig.port = 8080;
      baseConfig.databaseUrl = 'postgresql://rds-postgres-production:5432/smart_editor_prod';
      baseConfig.storage = {
        provider: 's3',
        bucketName: 'enterprise-assets-prod',
        endpoint: 'https://s3.amazonaws.com',
      };
      baseConfig.features.distributedRendering = true;
      baseConfig.features.collaborationEngine = true;
    } else if (mode === 'offline' || mode === 'desktop') {
      baseConfig.port = 3010;
      baseConfig.databaseUrl = 'sqlite://localhost/desktop_store.db';
      baseConfig.features.aiCreativeStudio = false; // Requires internet
    }

    return baseConfig;
  }
}
