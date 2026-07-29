import { MediaAsset, AssetFolder, AssetCollection } from '../types';
import { globalMediaManagementPluginRegistry } from '../plugins';

export class AssetCatalogService {
  private assets: Map<string, MediaAsset> = new Map();
  private folders: Map<string, AssetFolder> = new Map();
  private collections: Map<string, AssetCollection> = new Map();

  constructor() {
    this.createDefaultFolders();
    this.createDefaultCollections();
  }

  private createDefaultFolders(): void {
    const folders: AssetFolder[] = [
      { id: 'folder_raw', name: 'Raw Media Ingest', createdAt: new Date().toISOString() },
      { id: 'folder_renders', name: 'Processed Renders', createdAt: new Date().toISOString() },
      { id: 'folder_broll', name: 'B-Roll Footage', createdAt: new Date().toISOString() },
    ];
    for (const f of folders) {
      this.folders.set(f.id, f);
    }
  }

  private createDefaultCollections(): void {
    const colls: AssetCollection[] = [
      {
        id: 'coll_favorites',
        name: 'My Favorites',
        assetIds: [],
        type: 'favorites',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'coll_saved_recent',
        name: 'Recently Added Renders',
        assetIds: [],
        type: 'saved_search',
        smartCriteria: { fileTypes: ['mp4', 'mov'] },
        createdAt: new Date().toISOString(),
      },
    ];
    for (const c of colls) {
      this.collections.set(c.id, c);
    }
  }

  public registerAsset(asset: MediaAsset): void {
    // Duplicate detection check
    const existing = Array.from(this.assets.values()).find((a) => a.checksum === asset.checksum);
    if (existing) {
      throw new Error(`Duplicate asset detected. Asset with same checksum already exists (ID: ${existing.id})`);
    }

    this.assets.set(asset.id, asset);

    // Update dynamic smart collections
    this.updateSmartCollections();
  }

  public getAsset(id: string): MediaAsset | undefined {
    return this.assets.get(id);
  }

  public listAssets(folderId?: string): MediaAsset[] {
    const all = Array.from(this.assets.values());
    if (folderId) {
      return all.filter((a) => a.folderId === folderId);
    }
    return all;
  }

  public registerFolder(folder: AssetFolder): void {
    this.folders.set(folder.id, folder);
  }

  public getFolder(id: string): AssetFolder | undefined {
    return this.folders.get(id);
  }

  public listFolders(): AssetFolder[] {
    return Array.from(this.folders.values());
  }

  public registerCollection(collection: AssetCollection): void {
    this.collections.set(collection.id, collection);
  }

  public getCollection(id: string): AssetCollection | undefined {
    return this.collections.get(id);
  }

  public listCollections(): AssetCollection[] {
    return Array.from(this.collections.values());
  }

  public updateSmartCollections(): void {
    const allAssets = Array.from(this.assets.values());

    for (const col of this.collections.values()) {
      if (col.type === 'smart' || col.type === 'saved_search' || col.type === 'dynamic') {
        const criteria = col.smartCriteria;
        if (!criteria) continue;

        const matchedIds = allAssets
          .filter((asset) => {
            // Filter by file types
            if (criteria.fileTypes && criteria.fileTypes.length > 0) {
              const ext = asset.name.split('.').pop()?.toLowerCase();
              if (!ext || !criteria.fileTypes.includes(ext)) return false;
            }

            // Filter by tags
            if (criteria.tags && criteria.tags.length > 0) {
              const tags = asset.metadata.aiGeneratedTags || [];
              const hasTag = criteria.tags.some((t) => tags.includes(t));
              if (!hasTag) return false;
            }

            // Filter by search query
            if (criteria.searchQuery) {
              const q = criteria.searchQuery.toLowerCase();
              const matchesName = asset.name.toLowerCase().includes(q);
              if (!matchesName) return false;
            }

            return true;
          })
          .map((a) => a.id);

        col.assetIds = matchedIds;
      }
    }
  }
}

export const globalAssetCatalogService = new AssetCatalogService();
