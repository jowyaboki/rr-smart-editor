import { IFileSystemService, WatchFolder, LocalAsset } from '@ai-video-editor/desktop-core';

export class FileSystemService implements IFileSystemService {
  private watchedFolders: Map<string, WatchFolder> = new Map();
  private cache: Map<string, string> = new Map();
  private mockAssets: LocalAsset[] = [
    { filepath: '/user/movies/sunset.mp4', filename: 'sunset.mp4', size: 1042000, mimeType: 'video/mp4', indexedAt: new Date().toISOString() },
    { filepath: '/user/audio/vocals.wav', filename: 'vocals.wav', size: 45000, mimeType: 'audio/wav', indexedAt: new Date().toISOString() }
  ];

  public async watchFolder(path: string, recursive: boolean): Promise<boolean> {
    this.watchedFolders.set(path, {
      path,
      recursive,
      indexedAt: new Date().toISOString(),
    });
    return true;
  }

  public async unwatchFolder(path: string): Promise<boolean> {
    return this.watchedFolders.delete(path);
  }

  public async listWatchedFolders(): Promise<WatchFolder[]> {
    return Array.from(this.watchedFolders.values());
  }

  public async searchLocalAssets(query: string): Promise<LocalAsset[]> {
    return this.mockAssets.filter(asset =>
      asset.filename.toLowerCase().includes(query.toLowerCase())
    );
  }

  public async writeLocalCache(key: string, data: string): Promise<void> {
    this.cache.set(key, data);
  }

  public async readLocalCache(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }
}
