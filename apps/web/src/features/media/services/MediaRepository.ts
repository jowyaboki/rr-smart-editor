import { MediaAsset, MediaFolder } from '../types';

export interface MediaRepository {
  getAssets(): Promise<MediaAsset[]>;
  getFolders(): Promise<MediaFolder[]>;
  saveAsset(asset: MediaAsset): Promise<MediaAsset>;
  deleteAsset(id: string): Promise<void>;
  updateAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset>;
  createFolder(folder: MediaFolder): Promise<MediaFolder>;
  deleteFolder(id: string): Promise<void>;
  moveAsset(assetId: string, folderId: string | null): Promise<void>;
}

export class LocalStorageMediaRepository implements MediaRepository {
  private ASSETS_KEY = 'rr_editor_media_assets';
  private FOLDERS_KEY = 'rr_editor_media_folders';

  private getStored<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStored<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getAssets(): Promise<MediaAsset[]> {
    return this.getStored<MediaAsset>(this.ASSETS_KEY);
  }

  async getFolders(): Promise<MediaFolder[]> {
    return this.getStored<MediaFolder>(this.FOLDERS_KEY);
  }

  async saveAsset(asset: MediaAsset): Promise<MediaAsset> {
    const assets = this.getStored<MediaAsset>(this.ASSETS_KEY);
    assets.push(asset);
    this.setStored(this.ASSETS_KEY, assets);
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    const assets = this.getStored<MediaAsset>(this.ASSETS_KEY).filter((a) => a.id !== id);
    this.setStored(this.ASSETS_KEY, assets);
  }

  async updateAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset> {
    const assets = this.getStored<MediaAsset>(this.ASSETS_KEY);
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    assets[index] = { ...assets[index], ...updates, updatedAt: new Date().toISOString() };
    this.setStored(this.ASSETS_KEY, assets);
    return assets[index];
  }

  async createFolder(folder: MediaFolder): Promise<MediaFolder> {
    const folders = this.getStored<MediaFolder>(this.FOLDERS_KEY);
    folders.push(folder);
    this.setStored(this.FOLDERS_KEY, folders);
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    const folders = this.getStored<MediaFolder>(this.FOLDERS_KEY).filter((f) => f.id !== id);
    this.setStored(this.FOLDERS_KEY, folders);
    // Also move assets in this folder to root or delete? Let's move to root.
    const assets = this.getStored<MediaAsset>(this.ASSETS_KEY).map(a => a.folderId === id ? { ...a, folderId: null } : a);
    this.setStored(this.ASSETS_KEY, assets);
  }

  async moveAsset(assetId: string, folderId: string | null): Promise<void> {
    await this.updateAsset(assetId, { folderId });
  }
}
