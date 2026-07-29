import { z } from 'zod';

// Api Application & Keys
export interface ApiApplication {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientSecret: string;
  ownerId: string;
  createdAt: string;
}

export const ApiApplicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
});

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string; // e.g. "rr_live_"
  secretKeyHash: string;
  applicationId: string;
  scopes: string[];
  rateLimitOverride?: number; // requests per minute
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  keyPrefix: z.string(),
  secretKeyHash: z.string(),
  applicationId: z.string(),
  scopes: z.array(z.string()),
  rateLimitOverride: z.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

// OAuth Clients & Tokens
export interface OAuthClient {
  id: string;
  name: string;
  redirectUris: string[];
  allowedGrantTypes: string[]; // e.g. ['authorization_code', 'client_credentials']
  createdAt: string;
}

export const OAuthClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  redirectUris: z.array(z.string()),
  allowedGrantTypes: z.array(z.string()),
  createdAt: z.string(),
});

export interface ApiToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken?: string;
  scope: string;
}

export const ApiTokenSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
  refreshToken: z.string().optional(),
  scope: z.string(),
});

// Version & Rate Limiting & Scopes
export interface ApiVersion {
  version: 'v1' | 'v2' | 'v3';
  isDeprecated: boolean;
  sunsetAt?: string;
}

export const ApiVersionSchema = z.object({
  version: z.enum(['v1', 'v2', 'v3']),
  isDeprecated: z.boolean(),
  sunsetAt: z.string().optional(),
});

export interface ApiRateLimit {
  requestsPerMinute: number;
  burstLimit: number;
  quotaPerDay?: number;
}

export const ApiRateLimitSchema = z.object({
  requestsPerMinute: z.number(),
  burstLimit: z.number(),
  quotaPerDay: z.number().optional(),
});

export type ApiScope = 'projects:read' | 'projects:write' | 'timeline:read' | 'timeline:write' | 'renders:write' | 'assets:read' | 'assets:write';

export const ApiScopeSchema = z.enum([
  'projects:read',
  'projects:write',
  'timeline:read',
  'timeline:write',
  'renders:write',
  'assets:read',
  'assets:write',
]);

// Webhooks & Webhook Events
export interface Webhook {
  id: string;
  applicationId: string;
  url: string;
  secret: string; // for signature validation (e.g. HMAC-SHA256)
  subscribedEvents: string[]; // e.g. ['project.created', 'render.completed']
  isActive: boolean;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export const WebhookSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  url: z.string(),
  secret: z.string(),
  subscribedEvents: z.array(z.string()),
  isActive: z.boolean(),
  retryPolicy: z
    .object({
      maxRetries: z.number(),
      backoffMs: z.number(),
    })
    .optional(),
});

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  timestamp: string;
  deliveryStatus: 'pending' | 'success' | 'failed' | 'retrying';
  attemptsCount: number;
  lastAttemptResponse?: string;
}

export const WebhookEventSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  event: z.string(),
  payload: z.record(z.string(), z.any()),
  timestamp: z.string(),
  deliveryStatus: z.enum(['pending', 'success', 'failed', 'retrying']),
  attemptsCount: z.number(),
  lastAttemptResponse: z.string().optional(),
});

// Telemetry & Auditing
export interface ApiRequest {
  id: string;
  apiKeyId?: string;
  clientId?: string;
  ipAddress: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiVersion: string;
  headers: Record<string, string>;
  bodySize: number;
}

export const ApiRequestSchema = z.object({
  id: z.string(),
  apiKeyId: z.string().optional(),
  clientId: z.string().optional(),
  ipAddress: z.string(),
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  apiVersion: z.string(),
  headers: z.record(z.string(), z.string()),
  bodySize: z.number(),
});

export interface ApiResponse {
  requestId: string;
  statusCode: number;
  bodySize: number;
  durationMs: number;
}

export const ApiResponseSchema = z.object({
  requestId: z.string(),
  statusCode: z.number(),
  bodySize: z.number(),
  durationMs: z.number(),
});

export interface ApiAuditEvent {
  id: string;
  timestamp: string;
  applicationId?: string;
  apiKeyId?: string;
  action: string; // e.g. "apikey.rotated", "webhook.delivery_failed"
  ipAddress: string;
  details: Record<string, any>;
}

export const ApiAuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  applicationId: z.string().optional(),
  apiKeyId: z.string().optional(),
  action: z.string(),
  ipAddress: z.string(),
  details: z.record(z.string(), z.any()),
});

// Extensibility interfaces
export interface ApiGatewayEndpointPlugin {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiredScopes: ApiScope[];
  handler(request: ApiRequest): Promise<{ statusCode: number; body: Record<string, any> }>;
}

export interface WebhookEventPlugin {
  id: string;
  name: string;
  description: string;
}

export interface IntegrationConnectorPlugin {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'cloud_storage' | 'vcs';
  initialize(config: Record<string, any>): Promise<void>;
  dispatch(event: string, payload: Record<string, any>): Promise<void>;
}
