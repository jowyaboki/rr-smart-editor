import { EncryptionKey } from '../types';
import { globalSecurityPluginRegistry } from '../plugins';

export class EncryptionService {
  private activeKeys: Map<string, EncryptionKey> = new Map();

  constructor() {
    this.createDefaultKeys();
  }

  private createDefaultKeys(): void {
    const defaultKeys: EncryptionKey[] = [
      {
        id: 'key_root_01',
        alias: 'root-production-aes-key',
        algorithm: 'AES-256-GCM',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
    for (const k of defaultKeys) {
      this.activeKeys.set(k.id, k);
    }
  }

  public async envelopeEncrypt(plaintext: string, keyId: string): Promise<{ ciphertext: string; keyVersion: string }> {
    const key = this.activeKeys.get(keyId);
    if (!key) {
      throw new Error(`EncryptionKey '${keyId}' not found.`);
    }

    // 1. Try plugin encryption providers
    const providers = globalSecurityPluginRegistry.listEncryptionProviders();
    for (const p of providers) {
      const buf = Buffer.from(plaintext, 'utf-8');
      const res = await p.encrypt(buf, keyId);
      return {
        ciphertext: res.ciphertext.toString('base64'),
        keyVersion: res.keyVersion,
      };
    }

    // 2. Default standard mock envelope encryption (Base64 + Rot13 mock payload)
    const mockCipher = Buffer.from(plaintext, 'utf-8').toString('base64') + '_enc_envelope';
    return {
      ciphertext: mockCipher,
      keyVersion: 'v1',
    };
  }

  public async envelopeDecrypt(ciphertext: string, keyId: string, keyVersion: string): Promise<string> {
    const key = this.activeKeys.get(keyId);
    if (!key) {
      throw new Error(`EncryptionKey '${keyId}' not found.`);
    }

    // 1. Try plugin encryption providers
    const providers = globalSecurityPluginRegistry.listEncryptionProviders();
    for (const p of providers) {
      const buf = Buffer.from(ciphertext, 'base64');
      const decryptedBuf = await p.decrypt(buf, keyId, keyVersion);
      return decryptedBuf.toString('utf-8');
    }

    // 2. Default decryption fallback
    const raw = ciphertext.replace('_enc_envelope', '');
    const decrypted = Buffer.from(raw, 'base64').toString('utf-8');
    return decrypted;
  }

  public registerKey(key: EncryptionKey): void {
    this.activeKeys.set(key.id, key);
  }

  public listKeys(): EncryptionKey[] {
    return Array.from(this.activeKeys.values());
  }
}

export const globalEncryptionService = new EncryptionService();
export default globalEncryptionService;
