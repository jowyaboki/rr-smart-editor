import { z } from 'zod';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  scopes: string[];
  expiresAt?: number;
}

export const ApiKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.number().optional(),
});

export interface WebhookDelivery {
  id: string;
  event: 'render_completed' | 'project_updated' | 'workflow_finished' | 'publishing_completed' | 'asset_imported' | 'ai_task_completed' | 'plugin_installed';
  payload: any;
  timestamp: number;
  status: 'sent' | 'failed' | 'retry';
  retryCount: number;
}

export interface RateLimitConfig {
  perUserLimit: number;
  perKeyLimit: number;
  perIpLimit: number;
  burstLimit: number;
}

export interface SdkOptions {
  apiKey?: string;
  bearerToken?: string;
  endpoint?: string;
  timeout?: number;
}
