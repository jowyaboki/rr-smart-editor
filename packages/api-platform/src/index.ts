import { ApiGatewayService, globalApiGatewayService } from './services/ApiGatewayService';
import { ApiVersionService, globalApiVersionService } from './services/ApiVersionService';
import { WebhookService, globalWebhookService } from './services/WebhookService';
import { RateLimitService, globalRateLimitService } from './services/RateLimitService';
import { IntegrationService, globalIntegrationService } from './services/IntegrationService';

export * from './types';
export * from './plugins';
export { ApiGatewayService, globalApiGatewayService };
export { ApiVersionService, globalApiVersionService };
export { WebhookService, globalWebhookService };
export { RateLimitService, globalRateLimitService };
export { IntegrationService, globalIntegrationService };

export class ApiPlatformEngine {
  public gatewayService: ApiGatewayService;
  public versionService: ApiVersionService;
  public webhookService: WebhookService;
  public rateLimitService: RateLimitService;
  public integrationService: IntegrationService;

  constructor() {
    this.gatewayService = globalApiGatewayService;
    this.versionService = globalApiVersionService;
    this.webhookService = globalWebhookService;
    this.rateLimitService = globalRateLimitService;
    this.integrationService = globalIntegrationService;
  }
}

export const globalApiPlatformEngine = new ApiPlatformEngine();
export default globalApiPlatformEngine;
