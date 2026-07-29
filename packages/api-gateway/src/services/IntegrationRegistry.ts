import { IntegrationConnectorPlugin } from '@ai-video-editor/api-contracts';
import { globalApiPluginRegistry } from '../plugins';

export class IntegrationRegistry {
  private activeConnectors: Map<string, { type: string; config: Record<string, any> }> = new Map();

  public async enableConnector(id: string, type: string, config: Record<string, any>): Promise<void> {
    // Check if plugin is registered
    const connector = globalApiPluginRegistry.getConnector(id);
    if (connector) {
      await connector.initialize(config);
    }
    this.activeConnectors.set(id, { type, config });
  }

  public listActiveConnectors(): Array<{ id: string; type: string; config: Record<string, any> }> {
    return Array.from(this.activeConnectors.entries()).map(([id, val]) => ({
      id,
      type: val.type,
      config: val.config,
    }));
  }
}

export const globalIntegrationRegistry = new IntegrationRegistry();
export default globalIntegrationRegistry;
