export interface ResolvedAsset {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image' | 'audio';
  provider: string;
}

export interface StockAdapter {
  id: string;
  name: string;
  resolvePlaceholder(keyword: string, type: 'video' | 'image' | 'audio'): Promise<ResolvedAsset>;
}

// Concrete Adapters preventing tight coupling to the editor
export class PexelsAdapter implements StockAdapter {
  id = 'pexels';
  name = 'Pexels Media Stock';

  async resolvePlaceholder(keyword: string, type: 'video' | 'image' | 'audio'): Promise<ResolvedAsset> {
    return {
      id: `pexels-${Math.random().toString(36).substr(2, 5)}`,
      name: `${keyword} (Pexels Stock)`,
      url: `/assets/stock/pexels-${type}.mp4`, // Safe relative mock assets
      type,
      provider: 'Pexels'
    };
  }
}

export class UnsplashAdapter implements StockAdapter {
  id = 'unsplash';
  name = 'Unsplash Images';

  async resolvePlaceholder(keyword: string, type: 'video' | 'image' | 'audio'): Promise<ResolvedAsset> {
    return {
      id: `unsplash-${Math.random().toString(36).substr(2, 5)}`,
      name: `${keyword} (Unsplash Stock)`,
      url: `/assets/stock/unsplash-${type}.jpg`,
      type,
      provider: 'Unsplash'
    };
  }
}

export class LocalStockAdapter implements StockAdapter {
  id = 'local';
  name = 'Local Assets Library';

  async resolvePlaceholder(keyword: string, type: 'video' | 'image' | 'audio'): Promise<ResolvedAsset> {
    return {
      id: `local-${Math.random().toString(36).substr(2, 5)}`,
      name: `${keyword} (Local Library)`,
      url: `/assets/stock/local-${type}.mp4`,
      type,
      provider: 'Local'
    };
  }
}

export class AssetResolver {
  private adapters: Map<string, StockAdapter> = new Map();
  private defaultAdapterId = 'local';

  constructor() {
    this.registerAdapter(new PexelsAdapter());
    this.registerAdapter(new UnsplashAdapter());
    this.registerAdapter(new LocalStockAdapter());
  }

  public registerAdapter(adapter: StockAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  public async resolve(keyword: string, type: 'video' | 'image' | 'audio', preferredProvider?: string): Promise<ResolvedAsset> {
    const providerId = preferredProvider || this.defaultAdapterId;
    const adapter = this.adapters.get(providerId) || new LocalStockAdapter();
    return adapter.resolvePlaceholder(keyword, type);
  }
}

export const globalAssetResolver = new AssetResolver();
