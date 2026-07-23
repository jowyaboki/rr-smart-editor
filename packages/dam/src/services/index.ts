import { Asset, AssetVersion, AssetMetadata, AssetCollection, AssetFolder, AssetApprovalStatus, AssetApproval, AssetLicense, AssetUsage } from '../types';

// ==========================================
// 1. METADATA SERVICE
// ==========================================
export class MetadataService {
  public updateMetadata(asset: Asset, updates: Partial<AssetMetadata>): void {
    asset.metadata = {
      ...asset.metadata,
      ...updates,
    };
  }

  public extractAIKeywords(text: string): string[] {
    const common = ['the', 'and', 'this', 'that', 'with'];
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3 && !common.includes(w));
  }
}

// ==========================================
// 2. VERSION SERVICE
// ==========================================
export class VersionService {
  public createVersion(asset: Asset, newVersion: Omit<AssetVersion, 'uploadedAt'>): void {
    const version: AssetVersion = {
      ...newVersion,
      uploadedAt: Date.now(),
    };
    asset.versions.push(version);
    // Update main asset pointer
    asset.checksum = version.checksum;
    asset.url = version.url;
    asset.metadata.fileType = version.url.split('.').pop() || 'unknown';
  }

  public restoreVersion(asset: Asset, targetVersion: string): void {
    const match = asset.versions.find(v => v.version === targetVersion);
    if (!match) {
      throw new Error(`Restoration failed: Version "${targetVersion}" does not exist.`);
    }
    // Repoint main pointer
    asset.checksum = match.checksum;
    asset.url = match.url;
  }
}

// ==========================================
// 3. APPROVAL SERVICE
// ==========================================
export class ApprovalService {
  public transitionStatus(
    asset: Asset,
    status: AssetApprovalStatus,
    reviewer: string,
    comment?: string
  ): void {
    const approval = asset.approval;
    approval.status = status;
    if (comment) {
      if (!approval.reviewerComments) approval.reviewerComments = [];
      approval.reviewerComments.push(comment);
    }
    approval.history.push({
      status,
      reviewer,
      timestamp: Date.now(),
      comment,
    });
  }
}

// ==========================================
// 4. SEARCH SERVICE
// ==========================================
export class SearchService {
  /**
   * Filters library assets by keywords, AI tags, speech text, codecs, and dimensions
   */
  public search(
    assets: Asset[],
    query: string,
    filters?: { fileType?: string; codec?: string; resolution?: string }
  ): Asset[] {
    const q = query.toLowerCase();

    return assets.filter(asset => {
      // 1. Check textual queries
      const matchesText =
        asset.name.toLowerCase().includes(q) ||
        asset.metadata.title.toLowerCase().includes(q) ||
        asset.metadata.description.toLowerCase().includes(q) ||
        asset.metadata.keywords.some(k => k.toLowerCase().includes(q)) ||
        (asset.metadata.aiGeneratedTags && asset.metadata.aiGeneratedTags.some(t => t.toLowerCase().includes(q)));

      if (query && !matchesText) return false;

      // 2. Filter checks
      if (filters?.fileType && asset.metadata.fileType !== filters.fileType) return false;
      if (filters?.codec && asset.metadata.codec !== filters.codec) return false;

      return true;
    });
  }
}

// ==========================================
// 5. RIGHTS SERVICE
// ==========================================
export class RightsService {
  /**
   * Checks license expiration status and territorial restrictions
   */
  public isAuthorized(license: AssetLicense, territory?: string): { authorized: boolean; reason?: string } {
    if (license.expirationDate && license.expirationDate < Date.now()) {
      return { authorized: false, reason: 'LICENSE_EXPIRED' };
    }

    if (territory && license.territory && license.territory !== 'global' && license.territory !== territory) {
      return { authorized: false, reason: 'TERRITORIAL_RESTRICTION' };
    }

    return { authorized: true };
  }
}

// ==========================================
// 6. USAGE SERVICE
// ==========================================
export class UsageService {
  public trackUsage(asset: Asset, projectId: string, clipId: string): void {
    if (!asset.usage.projectsUsedIn.includes(projectId)) {
      asset.usage.projectsUsedIn.push(projectId);
    }
    asset.usage.timelineClipsCount += 1;
  }

  public untrackUsage(asset: Asset, projectId: string): void {
    asset.usage.timelineClipsCount = Math.max(0, asset.usage.timelineClipsCount - 1);
  }
}

// ==========================================
// 7. ASSET LIBRARY SERVICE
// ==========================================
export class AssetLibraryService {
  public readonly metadata = new MetadataService();
  public readonly versions = new VersionService();
  public readonly approvals = new ApprovalService();
  public readonly searchService = new SearchService();
  public readonly rights = new RightsService();
  public readonly usage = new UsageService();

  private assets = new Map<string, Asset>();
  private folders = new Map<string, AssetFolder>();
  private collections = new Map<string, AssetCollection>();

  public createAsset(asset: Asset): void {
    this.assets.set(asset.id, asset);
  }

  public getAsset(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  public listAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  public deleteAsset(id: string): void {
    this.assets.delete(id);
  }

  // Folders and Collections
  public createFolder(folder: AssetFolder): void {
    this.folders.set(folder.id, folder);
  }

  public createCollection(collection: AssetCollection): void {
    this.collections.set(collection.id, collection);
  }

  public getCollection(id: string): AssetCollection | undefined {
    return this.collections.get(id);
  }
}
export const assetLibrary = new AssetLibraryService();
