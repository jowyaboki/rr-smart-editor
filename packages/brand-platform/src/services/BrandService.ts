import { BrandKit } from '../types';

export class BrandService {
  private activeKit: BrandKit | null = null;
  private brandKits: Map<string, BrandKit> = new Map();

  public registerBrandKit(kit: BrandKit): void {
    this.brandKits.set(kit.id, kit);
    if (!this.activeKit) {
      this.activeKit = kit;
    }
  }

  public getActiveBrandKit(): BrandKit | null {
    return this.activeKit;
  }

  public setActiveBrandKit(id: string): void {
    const kit = this.brandKits.get(id);
    if (kit) {
      this.activeKit = kit;
    } else {
      throw new Error(`Brand kit '${id}' not found.`);
    }
  }

  public getBrandKit(id: string): BrandKit | undefined {
    return this.brandKits.get(id);
  }

  public listBrandKits(): BrandKit[] {
    return Array.from(this.brandKits.values());
  }
}
