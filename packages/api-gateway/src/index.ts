import { ApiGatewayService, globalApiGatewayService } from './services/ApiGatewayService';
import { AuthenticationGateway, globalAuthenticationGateway } from './services/AuthenticationGateway';
import { WebhookService, globalWebhookService } from './services/WebhookService';
import { SDKGeneratorService, globalSDKGeneratorService } from './services/SDKGeneratorService';
import { DocumentationService, globalDocumentationService } from './services/DocumentationService';
import { RateLimitService, globalRateLimitService } from './services/RateLimitService';
import { IntegrationRegistry, globalIntegrationRegistry } from './services/IntegrationRegistry';

export * from '@ai-video-editor/api-contracts';
export * from './plugins';
export { ApiGatewayService, globalApiGatewayService };
export { AuthenticationGateway, globalAuthenticationGateway };
export { WebhookService, globalWebhookService };
export { SDKGeneratorService, globalSDKGeneratorService };
export { DocumentationService, globalDocumentationService };
export { RateLimitService, globalRateLimitService };
export { IntegrationRegistry, globalIntegrationRegistry };

export class ApiGatewayPlatformEngine {
  public gatewayService: ApiGatewayService;
  public authGateway: AuthenticationGateway;
  public webhookService: WebhookService;
  public sdkGenerator: SDKGeneratorService;
  public docService: DocumentationService;
  public rateLimitService: RateLimitService;
  public integrationRegistry: IntegrationRegistry;

  constructor() {
    this.gatewayService = globalApiGatewayService;
    this.authGateway = globalAuthenticationGateway;
    this.webhookService = globalWebhookService;
    this.sdkGenerator = globalSDKGeneratorService;
    this.docService = globalDocumentationService;
    this.rateLimitService = globalRateLimitService;
    this.integrationRegistry = globalIntegrationRegistry;
  }
}

export const globalApiGatewayPlatformEngine = new ApiGatewayPlatformEngine();
export default globalApiGatewayPlatformEngine;
