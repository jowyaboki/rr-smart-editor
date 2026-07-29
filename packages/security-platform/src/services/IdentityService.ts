import { Identity } from '../types';
import { globalSecurityPluginRegistry } from '../plugins';

export class IdentityService {
  private identities: Map<string, Identity> = new Map();

  constructor() {
    this.createDefaultIdentities();
  }

  private createDefaultIdentities(): void {
    const users: Identity[] = [
      {
        id: 'user_jules',
        username: 'Jules',
        email: 'jules@broadway.net',
        status: 'active',
        mfaEnabled: true,
        mfaSecret: 'JULES_MFA_SECRET_999',
        authProvider: 'password',
        attributes: { department: 'Engineering', clearanceLevel: 'internal', location: 'US' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user_admin',
        username: 'Admin',
        email: 'admin@broadway.net',
        status: 'active',
        mfaEnabled: true,
        authProvider: 'passkeys',
        attributes: { department: 'Operations', clearanceLevel: 'critical', location: 'EU' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const u of users) {
      this.identities.set(u.id, u);
    }
  }

  public async authenticate(username: string, credentials: Record<string, any>): Promise<{ success: boolean; identity?: Identity; error?: string }> {
    // 1. Try plugin identity providers first
    const identityProviders = globalSecurityPluginRegistry.listIdentityProviders();
    for (const p of identityProviders) {
      const res = await p.authenticate({ username, ...credentials });
      if (res.success) return res;
    }

    // 2. Default password authentication simulation
    const id = Array.from(this.identities.values()).find((u) => u.username === username);
    if (!id) {
      return { success: false, error: 'Identity not found.' };
    }

    if (id.status !== 'active') {
      return { success: false, error: `Identity suspended or deactivated. Status: ${id.status}` };
    }

    if (credentials.password === 'failing_password') {
      return { success: false, error: 'Invalid password credentials.' };
    }

    return { success: true, identity: id };
  }

  public registerIdentity(identity: Identity): void {
    this.identities.set(identity.id, identity);
  }

  public getIdentity(id: string): Identity | undefined {
    return this.identities.get(id);
  }

  public listIdentities(): Identity[] {
    return Array.from(this.identities.values());
  }
}

export const globalIdentityService = new IdentityService();
export default globalIdentityService;
