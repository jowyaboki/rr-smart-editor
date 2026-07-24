import { BrandVersion, BrandKit } from '../types';

export class BrandVersionService {
  private versions: BrandVersion[] = [];

  public createVersion(version: string, kit: BrandKit, author: string, changelog?: string): BrandVersion {
    const brandVersion: BrandVersion = {
      version,
      brandKit: JSON.parse(JSON.stringify(kit)),
      createdAt: new Date().toISOString(),
      author,
      changelog,
    };
    this.versions.push(brandVersion);
    return brandVersion;
  }

  public getVersion(version: string): BrandVersion | undefined {
    return this.versions.find(v => v.version === version);
  }

  public listVersions(): BrandVersion[] {
    return this.versions;
  }
}
