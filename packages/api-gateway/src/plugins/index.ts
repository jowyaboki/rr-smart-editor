import {
  ApiGatewayEndpointPlugin,
  WebhookEventPlugin,
  IntegrationConnectorPlugin,
} from '@ai-video-editor/api-contracts';

export class ApiPluginRegistry {
  private endpoints: Map<string, ApiGatewayEndpointPlugin> = new Map();
  private webhookEvents: Map<string, WebhookEventPlugin> = new Map();
  private connectors: Map<string, IntegrationConnectorPlugin> = new Map();

  public registerEndpoint(plugin: ApiGatewayEndpointPlugin): void {
    this.endpoints.set(`${plugin.method}:${plugin.path}`, plugin);
  }

  public registerWebhookEvent(plugin: WebhookEventPlugin): void {
    this.webhookEvents.set(plugin.id, plugin);
  }

  public registerConnector(plugin: IntegrationConnectorPlugin): void {
    this.connectors.set(plugin.id, plugin);
  }

  public getEndpoint(method: string, path: string): ApiGatewayEndpointPlugin | undefined {
    return this.endpoints.get(`${method}:${path}`);
  }

  public getConnector(id: string): IntegrationConnectorPlugin | undefined {
    return this.connectors.get(id);
  }

  public listEndpoints(): ApiGatewayEndpointPlugin[] {
    return Array.from(this.endpoints.values());
  }

  public listWebhookEvents(): WebhookEventPlugin[] {
    return Array.from(this.webhookEvents.values());
  }

  public listConnectors(): IntegrationConnectorPlugin[] {
    return Array.from(this.connectors.values());
  }
}

export const globalApiPluginRegistry = new ApiPluginRegistry();
export default globalApiPluginRegistry;
