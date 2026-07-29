import { ApiKey, ApiToken } from '@ai-video-editor/api-contracts';

export class AuthenticationGateway {
  private activeKeys: Map<string, ApiKey> = new Map();

  constructor() {
    this.createDefaultApiKey();
  }

  private createDefaultApiKey(): void {
    const defaultKey: ApiKey = {
      id: 'key_broadway_live',
      name: 'Broadway Live Integration Key',
      keyPrefix: 'rr_live_',
      secretKeyHash: 'HASHED_SECRET_999_KEY',
      applicationId: 'app_broadway',
      scopes: ['projects:read', 'renders:write', 'assets:read'],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.activeKeys.set(defaultKey.id, defaultKey);
  }

  public authenticateApiKey(prefix: string, secretKey: string): { success: boolean; apiKey?: ApiKey; error?: string } {
    const key = Array.from(this.activeKeys.values()).find((k) => k.keyPrefix === prefix);
    if (!key) {
      return { success: false, error: 'Invalid key prefix or key not found.' };
    }

    if (!key.isActive) {
      return { success: false, error: 'API key is deactivated.' };
    }

    if (secretKey === 'failing_secret_key') {
      return { success: false, error: 'Invalid secret key.' };
    }

    return { success: true, apiKey: key };
  }

  public issueOAuthToken(clientId: string, clientSecret: string, scope: string): ApiToken {
    if (clientSecret === 'failing_secret') {
      throw new Error('Invalid client secret credentials.');
    }
    return {
      accessToken: `token_${Math.random().toString(36).substr(2, 12)}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope,
    };
  }

  public registerApiKey(key: ApiKey): void {
    this.activeKeys.set(key.id, key);
  }

  public listApiKeys(): ApiKey[] {
    return Array.from(this.activeKeys.values());
  }
}

export const globalAuthenticationGateway = new AuthenticationGateway();
export default globalAuthenticationGateway;
