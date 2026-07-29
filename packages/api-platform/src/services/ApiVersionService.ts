import { ApiVersion } from '../types';

export class ApiVersionService {
  private activeVersions: Map<string, ApiVersion> = new Map();

  constructor() {
    this.createDefaultVersions();
  }

  private createDefaultVersions(): void {
    const v1: ApiVersion = { version: 'v1', isDeprecated: false };
    const v2: ApiVersion = { version: 'v2', isDeprecated: true, sunsetAt: '2025-12-31T00:00:00.000Z' };

    this.activeVersions.set(v1.version, v1);
    this.activeVersions.set(v2.version, v2);
  }

  public negotiateVersion(clientHeader?: string): string {
    if (!clientHeader) return 'v1'; // Default baseline fallback

    const target = clientHeader.trim().toLowerCase();
    if (this.activeVersions.has(target)) {
      return target;
    }
    return 'v1';
  }

  public listVersions(): ApiVersion[] {
    return Array.from(this.activeVersions.values());
  }
}

export const globalApiVersionService = new ApiVersionService();
export default globalApiVersionService;
