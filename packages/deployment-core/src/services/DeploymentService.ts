import { DeploymentMode } from '../types';

export class DeploymentService {
  private activeMode: DeploymentMode = 'development';

  public async bootstrap(mode: DeploymentMode): Promise<{
    success: boolean;
    mode: DeploymentMode;
    bootstrappedServices: string[];
  }> {
    this.activeMode = mode;
    const services = ['ConfigurationService', 'SecretsService', 'MigrationService', 'HealthService'];

    if (mode === 'production' || mode === 'cloud') {
      services.push('BackupService', 'LicenseService');
    }

    return {
      success: true,
      mode,
      bootstrappedServices: services,
    };
  }

  public getActiveMode(): DeploymentMode {
    return this.activeMode;
  }
}
