import { create } from 'zustand';
import {
  globalApiGatewayPlatformEngine,
  ApiKey,
  Webhook,
  WebhookEvent,
} from '@ai-video-editor/api-gateway';

interface DeveloperApiState {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  webhookEvents: WebhookEvent[];
  developerLogs: string[];

  // Interactive playground states
  playgroundPath: string;
  playgroundMethod: 'GET' | 'POST';
  playgroundHeaders: Record<string, string>;
  playgroundBody: string;
  playgroundResponse: any;
  playgroundResponseStatus: number | null;

  // Selection & Filters
  selectedApiKeyId: string | null;
  selectedWebhookId: string | null;
  activePanel: 'keys' | 'webhooks' | 'playground' | 'documentation';
  isLoading: boolean;

  // Actions
  initStore: () => void;
  loadApiKeys: () => void;
  loadWebhooks: () => void;
  loadWebhookEvents: () => void;
  selectApiKey: (id: string | null) => void;
  selectWebhook: (id: string | null) => void;
  setActivePanel: (panel: 'keys' | 'webhooks' | 'playground' | 'documentation') => void;
  setPlayground: (path: string, method: 'GET' | 'POST', body?: string) => void;

  // Delegation Actions
  createApiKey: (name: string, scopes: string[]) => Promise<void>;
  rotateApiKeySecret: (keyId: string) => Promise<void>;
  registerWebhookEndpoint: (url: string, secret: string, events: string[]) => Promise<void>;
  dispatchPlaygroundRequest: () => Promise<void>;
  generateClientSDK: (language: 'typescript' | 'python' | 'go') => string;
  addDevLog: (msg: string) => void;
}

export const useDeveloperApiStore = create<DeveloperApiState>((set, get) => {
  return {
    apiKeys: [],
    webhooks: [],
    webhookEvents: [],
    developerLogs: [],

    playgroundPath: '/v1/projects',
    playgroundMethod: 'GET',
    playgroundHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test_token_999' },
    playgroundBody: '{}',
    playgroundResponse: null,
    playgroundResponseStatus: null,

    selectedApiKeyId: null,
    selectedWebhookId: null,
    activePanel: 'playground',
    isLoading: false,

    initStore: () => {
      get().loadApiKeys();
      get().loadWebhooks();
      get().loadWebhookEvents();
      set({
        developerLogs: [
          `[${new Date().toISOString()}] [Gateway: Hub] API Gateway active at /api/v1/*`,
          `[${new Date().toISOString()}] [Gateway: Hub] Webhooks active with automated delivery dispatcher.`,
          `[${new Date().toISOString()}] [Gateway: Hub] Public SDK dynamic generators loaded.`,
        ],
      });
    },

    loadApiKeys: () => {
      const list = globalApiGatewayPlatformEngine.authGateway.listApiKeys();
      set({ apiKeys: list });
    },

    loadWebhooks: () => {
      const list = globalApiGatewayPlatformEngine.webhookService.listWebhooks();
      set({ webhooks: list });
    },

    loadWebhookEvents: () => {
      const list = globalApiGatewayPlatformEngine.webhookService.listSentEvents();
      set({ webhookEvents: list });
    },

    selectApiKey: (id) => set({ selectedApiKeyId: id }),
    selectWebhook: (id) => set({ selectedWebhookId: id }),
    setActivePanel: (panel) => set({ activePanel: panel }),

    setPlayground: (path, method, body) =>
      set({
        playgroundPath: path,
        playgroundMethod: method,
        playgroundBody: body || '{}',
        playgroundResponse: null,
        playgroundResponseStatus: null,
      }),

    // Delegation actions (no business logic in store)
    createApiKey: async (name, scopes) => {
      const keyId = `key_${Math.random().toString(36).substr(2, 9)}`;
      const apiKey: ApiKey = {
        id: keyId,
        name,
        keyPrefix: 'rr_live_',
        secretKeyHash: 'HASHED_SECRET_999_KEY',
        applicationId: 'app_dashboard_default',
        scopes,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      globalApiGatewayPlatformEngine.authGateway.registerApiKey(apiKey);
      get().loadApiKeys();

      const logMsg = `[${new Date().toISOString()}] [Event: ApiKeyCreate] Key '${name}' registered with scopes [${scopes.join(', ')}]`;
      set({
        developerLogs: [...get().developerLogs, logMsg],
        selectedApiKeyId: keyId,
      });
    },

    rotateApiKeySecret: async (keyId) => {
      const keys = globalApiGatewayPlatformEngine.authGateway.listApiKeys();
      const target = keys.find((k) => k.id === keyId);
      if (target) {
        target.secretKeyHash = `HASHED_SECRET_ROTATED_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        get().loadApiKeys();

        const logMsg = `[${new Date().toISOString()}] [Event: ApiKeyRotate] Rotated credentials secret hash for key ID '${keyId}'`;
        set({ developerLogs: [...get().developerLogs, logMsg] });
      }
    },

    registerWebhookEndpoint: async (url, secret, events) => {
      const hookId = `hook_${Math.random().toString(36).substr(2, 9)}`;
      const webhook = {
        id: hookId,
        applicationId: 'app_dashboard_default',
        url,
        secret,
        subscribedEvents: events,
        isActive: true,
      };

      globalApiGatewayPlatformEngine.webhookService.registerWebhook(webhook);
      get().loadWebhooks();

      const logMsg = `[${new Date().toISOString()}] [Event: WebhookRegister] Webhook registered for URL '${url}'`;
      set({
        developerLogs: [...get().developerLogs, logMsg],
        selectedWebhookId: hookId,
      });
    },

    dispatchPlaygroundRequest: async () => {
      set({ isLoading: true });
      try {
        const ip = '127.0.0.1';
        const apiReq = {
          id: `req_${Math.random().toString(36).substr(2, 9)}`,
          ipAddress: ip,
          path: get().playgroundPath,
          method: get().playgroundMethod,
          apiVersion: 'v1',
          headers: get().playgroundHeaders,
          bodySize: get().playgroundBody.length,
        };

        // Standard test scopes
        const scopes = ['projects:read', 'renders:write', 'assets:read'];

        const res = await globalApiGatewayPlatformEngine.gatewayService.handleRequest(apiReq, scopes);

        set({
          playgroundResponse: res.body,
          playgroundResponseStatus: res.statusCode,
        });

        // Trigger webhook delivery event simulation if post succeeds
        if (get().playgroundPath === '/v1/renders' && get().playgroundMethod === 'POST' && res.statusCode === 201) {
          await globalApiGatewayPlatformEngine.webhookService.dispatchEvent('render.completed', {
            jobId: res.body.job?.id || 'job_placeholder',
            status: 'completed',
          });
          get().loadWebhookEvents();
        }

        const logMsg = `[${new Date().toISOString()}] [Request: Gateway] matched '${get().playgroundMethod} ${get().playgroundPath}' status ${res.statusCode}`;
        set({ developerLogs: [...get().developerLogs, logMsg] });
      } finally {
        set({ isLoading: false });
      }
    },

    generateClientSDK: (language) => {
      if (language === 'typescript') {
        return globalApiGatewayPlatformEngine.sdkGenerator.generateTypeScriptSDK();
      } else if (language === 'python') {
        return globalApiGatewayPlatformEngine.sdkGenerator.generatePythonSDK();
      } else {
        return globalApiGatewayPlatformEngine.sdkGenerator.generateGoSDK();
      }
    },

    addDevLog: (msg) => {
      set({ developerLogs: [...get().developerLogs, `[${new Date().toISOString()}] ${msg}`] });
    },
  };
});

export default useDeveloperApiStore;
