import { SecretReference } from '../types';
import { globalSecurityPluginRegistry } from '../plugins';

export class SecretService {
  private secrets: Map<string, SecretReference> = new Map();
  private secretVault: Map<string, string> = new Map(); // Simulated secure in-memory vaults

  public async getSecret(name: string): Promise<string> {
    const ref = Array.from(this.secrets.values()).find((s) => s.name === name);
    if (!ref) {
      throw new Error(`Secret reference '${name}' not found.`);
    }

    // 1. Check plugin secret providers
    const providers = globalSecurityPluginRegistry.listSecretProviders();
    for (const p of providers) {
      try {
        const val = await p.getSecret(ref.vaultPath);
        return val;
      } catch (err) {
        console.error(`SecretProviderAdapter ${p.name} failed:`, err);
      }
    }

    // 2. Default mock secure vault resolution
    const secVal = this.secretVault.get(ref.vaultPath);
    if (!secVal) {
      throw new Error(`Secret value at path '${ref.vaultPath}' was not initialized in secure vaults.`);
    }

    return secVal;
  }

  public registerSecretReference(secret: SecretReference, value: string): void {
    this.secrets.set(secret.id, secret);
    this.secretVault.set(secret.vaultPath, value);
  }

  public async rotateSecret(secretId: string, newValue: string): Promise<SecretReference> {
    const ref = this.secrets.get(secretId);
    if (!ref) {
      throw new Error(`Secret reference '${secretId}' not found.`);
    }

    // Assign new Secure values in the vault
    this.secretVault.set(ref.vaultPath, newValue);
    ref.version = `v${parseInt(ref.version.substring(1) || '1', 10) + 1}`;
    ref.rotatedAt = new Date().toISOString();

    return ref;
  }

  public listSecrets(): SecretReference[] {
    return Array.from(this.secrets.values());
  }
}

export const globalSecretService = new SecretService();
export default globalSecretService;
