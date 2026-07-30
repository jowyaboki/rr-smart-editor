import { PlatformConfiguration } from '../types';

export class ConfigurationManager {
  private activeConfig: PlatformConfiguration = {
    global: { env: 'production', enableTelemetry: true },
    workspace: { maxConcurrency: 4 },
    moduleOverrides: {},
  };

  public getConfiguration(): PlatformConfiguration {
    return this.activeConfig;
  }

  public updateGlobalConfig(key: string, value: any): void {
    this.activeConfig.global[key] = value;
  }

  public updateModuleOverride(moduleId: string, key: string, value: any): void {
    this.activeConfig.moduleOverrides[moduleId] = this.activeConfig.moduleOverrides[moduleId] || {};
    this.activeConfig.moduleOverrides[moduleId][key] = value;
  }
}

export const globalConfigurationManager = new ConfigurationManager();
export default globalConfigurationManager;
