import { ISecretsService, Secret } from '../types';

export class SecretsService implements ISecretsService {
  private secrets: Map<string, Secret> = new Map();

  constructor() {
    // Populate base environmental secrets
    this.secrets.set('JWT_SECRET', {
      key: 'JWT_SECRET',
      value: 'dev_unsigned_jwt_secret_token_123',
      provider: 'env',
      version: 1,
      rotatedAt: new Date().toISOString(),
    });
  }

  public async getSecret(key: string): Promise<string> {
    const secret = this.secrets.get(key);
    if (!secret) {
      throw new Error(`Secret key '${key}' does not exist.`);
    }
    return secret.value;
  }

  public async setSecret(key: string, value: string, provider = 'env'): Promise<void> {
    const existing = this.secrets.get(key);
    const version = existing ? existing.version + 1 : 1;

    this.secrets.set(key, {
      key,
      value,
      provider,
      version,
      rotatedAt: new Date().toISOString(),
    });
  }

  public async rotateSecret(key: string): Promise<Secret> {
    const existing = this.secrets.get(key);
    if (!existing) {
      throw new Error(`Secret key '${key}' cannot be rotated because it does not exist.`);
    }

    const rotatedValue = `${existing.value}_rotated_${Math.random().toString(36).substr(2, 5)}`;
    const secret: Secret = {
      key,
      value: rotatedValue,
      provider: existing.provider,
      version: existing.version + 1,
      rotatedAt: new Date().toISOString(),
    };

    this.secrets.set(key, secret);
    return secret;
  }
}
