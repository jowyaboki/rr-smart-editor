import { MediaAsset, ArchivePolicy } from '../types';
import { globalMediaManagementPluginRegistry } from '../plugins';

export class ArchiveService {
  public async migrateStorageTier(
    asset: MediaAsset,
    targetTier: 'online' | 'nearline' | 'cold',
    policy?: ArchivePolicy
  ): Promise<void> {
    // 1. Run plugin archive adapters if registered
    const archiveProviders = globalMediaManagementPluginRegistry.listArchiveProviders();
    for (const p of archiveProviders) {
      if (targetTier === 'online') {
        const res = await p.restoreFromArchive(asset.id);
        asset.lifecycleState = res.status;
        asset.url = res.localUrl;
        asset.updatedAt = new Date().toISOString();
        return;
      } else {
        const res = await p.moveToArchive(asset.id, targetTier);
        asset.lifecycleState = res.status;
        asset.url = res.archiveUrl;
        asset.updatedAt = new Date().toISOString();
        return;
      }
    }

    // 2. Default standard storage tier transition mock
    await new Promise((r) => setTimeout(r, 10)); // simulation step

    if (targetTier === 'online') {
      asset.lifecycleState = 'online';
      asset.url = asset.url.replace('_archived', '');
    } else {
      asset.lifecycleState = targetTier;
      asset.url = asset.url + '_archived';
    }

    asset.updatedAt = new Date().toISOString();
  }
}

export const globalArchiveService = new ArchiveService();
