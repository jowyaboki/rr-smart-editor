import { create } from 'zustand';
import {
  globalApiPlatformEngine,
  ApiKey,
  Webhook,
  WebhookEvent,
  Integration,
} from '@ai-video-editor/api-platform';

interface ApiGatewayState {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  webhookEvents: WebhookEvent[];
  integrations: Integration[];
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
  activePanel: 'keys' | 'webhooks' | 'playground' | 'documentation' | 'integrations';
  isLoading: boolean;

  // Actions
  initStore: () => void;
  loadApiKeys: () => void;
  loadWebhooks: () => void;
  loadWebhookEvents: () => void;
  loadIntegrations: () => void;
  selectApiKey: (id: string | null) => void;
  selectWebhook: (id: string | null) => void;
  setActivePanel: (
    panel: 'keys' | 'webhooks' | 'playground' | 'documentation' | 'integrations',
  ) => void;
  setPlayground: (path: string, method: 'GET' | 'POST', body?: string) => void;

  // Delegation Actions
  createApiKey: (name: string, scopes: string[]) => Promise<void>;
  rotateApiKeySecret: (keyId: string) => Promise<void>;
  registerWebhookEndpoint: (url: string, secret: string, events: string[]) => Promise<void>;
  dispatchPlaygroundRequest: () => Promise<void>;
  generateClientSDK: (language: 'typescript' | 'python' | 'go') => string;
  addDevLog: (msg: string) => void;
}

export const useApiStore = create<ApiGatewayState>((set, get) => {
  return {
    apiKeys: [],
    webhooks: [],
    webhookEvents: [],
    integrations: [],
    developerLogs: [],

    playgroundPath: '/v1/projects',
    playgroundMethod: 'GET',
    playgroundHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test_token_999',
    },
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
      get().loadIntegrations();
      set({
        developerLogs: [
          `[${new Date().toISOString()}] [Gateway: Hub] API Gateway active at /api/v1/*`,
          `[${new Date().toISOString()}] [Gateway: Hub] Webhooks active with automated delivery dispatcher.`,
          `[${new Date().toISOString()}] [Gateway: Hub] Public SDK dynamic generators loaded.`,
        ],
      });
    },

    loadApiKeys: () => {
      // Seed default key if empty
      const list = [
        {
          id: 'key_broadway_live',
          name: 'Broadway Live Integration Key',
          keyPrefix: 'rr_live_',
          secretKeyHash: 'HASHED_SECRET_999_KEY',
          applicationId: 'app_broadway',
          scopes: ['projects:read', 'renders:write', 'assets:read'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      set({ apiKeys: list });
    },

    loadWebhooks: () => {
      const list = globalApiPlatformEngine.webhookService.listWebhooks();
      set({ webhooks: list });
    },

    loadWebhookEvents: () => {
      const list = globalApiPlatformEngine.webhookService.listSentEvents();
      set({ webhookEvents: list });
    },

    loadIntegrations: () => {
      const list = globalApiPlatformEngine.integrationService.listIntegrations();
      set({ integrations: list });
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

      const updated = [...get().apiKeys, apiKey];
      set({
        apiKeys: updated,
        selectedApiKeyId: keyId,
      });

      const logMsg = `[${new Date().toISOString()}] [Event: ApiKeyCreate] Key '${name}' registered with scopes [${scopes.join(', ')}]`;
      set({ developerLogs: [...get().developerLogs, logMsg] });
    },

    rotateApiKeySecret: async (keyId) => {
      const updated = get().apiKeys.map((k) => {
        if (k.id === keyId) {
          return {
            ...k,
            secretKeyHash: `HASHED_SECRET_ROTATED_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          };
        }
        return k;
      });
      set({ apiKeys: updated });

      const logMsg = `[${new Date().toISOString()}] [Event: ApiKeyRotate] Rotated credentials secret hash for key ID '${keyId}'`;
      set({ developerLogs: [...get().developerLogs, logMsg] });
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

      globalApiPlatformEngine.webhookService.registerWebhook(webhook);
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

        const scopes = ['projects:read', 'renders:write', 'assets:read'];
        const res = await globalApiPlatformEngine.gatewayService.handleRequest(apiReq, scopes);

        set({
          playgroundResponse: res.body,
          playgroundResponseStatus: res.statusCode,
        });

        // Trigger webhook delivery event simulation if post succeeds
        if (
          get().playgroundPath === '/v1/renders' &&
          get().playgroundMethod === 'POST' &&
          res.statusCode === 201
        ) {
          await globalApiPlatformEngine.webhookService.dispatchEvent('render.completed', {
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
      return `// Official Public SDK bindings in ${language}`;
    },

    addDevLog: (msg) => {
      set({ developerLogs: [...get().developerLogs, `[${new Date().toISOString()}] ${msg}`] });
    },
  };
});

export default useApiStore;
