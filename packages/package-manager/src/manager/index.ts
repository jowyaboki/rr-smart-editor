import { ExtensionManifest, Extension } from '@ai-video-editor/extension-sdk';
import {
  LocalPackage,
  DependencyNode,
  OnlineExtensionMeta,
  MarketplaceModerationReport,
  MarketplaceAnalytics,
  SecurityAuditResult
} from '../types';
import { DependencyResolver } from '../resolver';
import { PermissionManager } from '../permissions';
import { ValidationService } from '../validation';

export class PackageManager {
  public readonly resolver = new DependencyResolver();
  public readonly permissions = new PermissionManager();
  public readonly validator = new ValidationService();

  private installedPackages = new Map<string, LocalPackage>();
  private activeExtensions = new Map<string, Extension>();
  private rollbacksHistory = new Map<string, string[]>(); // id -> previous version manifests JSON

  // Marketplace Admin & Moderation Stores
  private moderationReports = new Map<string, MarketplaceModerationReport>();
  private featuredExtensionIds = new Set<string>();
  private securityAdvisories = new Map<string, string[]>(); // extensionId -> advisories
  private analyticsStore = new Map<string, MarketplaceAnalytics>();
  private onlineDatabase = new Map<string, any>(); // Online mock published extensions

  constructor() {
    this.seedMockOnlineDatabase();
  }

  private seedMockOnlineDatabase() {
    // Seed some mock templates and assets
    this.onlineDatabase.set('tpl-youtube-vlog', {
      id: 'tpl-youtube-vlog',
      name: 'youtube-vlog-template',
      displayName: 'YouTube Vlog Master Template',
      description: 'Fully responsive dynamic layout with animated captions, background audio track, and dynamic title overlays.',
      version: '1.0.0',
      category: 'template',
      downloads: 4500,
      rating: 4.8,
      changelog: ['v1.0.0: Initial release of full vlog asset stack.'],
      screenshots: ['scr_youtube1.png', 'scr_youtube2.png'],
      metadata: {
        timeline: { tracks: [] },
        assets: ['music_track.mp3', 'outro_video.mp4'],
        fonts: ['Inter', 'Montserrat'],
        animations: ['zoom_in_fade', 'slide_out_right'],
        effects: ['reinhard_tonemap', 'lift_gamma_gain'],
        variables: ['video_title', 'vlog_date'],
        aiPrompts: ['"Generate a high-energy cinematic vlog title sequence suitable for travel clips"'],
      }
    });

    this.onlineDatabase.set('asset-cinema-lut', {
      id: 'asset-cinema-lut',
      name: 'cinematic-3d-lut-asset',
      displayName: 'Hollywood Cinematic 3D LUT Pack',
      description: 'Premium LUT color adaptation presets matching industry grading standard domains.',
      version: '1.1.0',
      category: 'asset',
      downloads: 12000,
      rating: 4.9,
      changelog: ['v1.1.0: Expanded compatibility with Rec709 and ACEScg pipelines.'],
      screenshots: ['lut_before_after.png'],
      metadata: {
        assetType: 'LUTs',
        format: '.cube',
        colorSpace: 'ACEScg',
      }
    });
  }

  /**
   * Safe Zip or Folder offline installation orchestration
   */
  public async installPackage(
    manifestPayload: any,
    onConfirmPermission?: (extId: string, perm: any) => Promise<boolean>
  ): Promise<LocalPackage> {
    // 1. Manifest static structure and signature validation
    const validation = this.validator.validateManifest(manifestPayload);
    if (!validation.valid) {
      throw new Error(`Package validation failed: ${validation.errors?.join(', ')}`);
    }

    const manifest = manifestPayload as ExtensionManifest;

    // 2. Manage and request permissions authorization
    const authorized = await this.permissions.requestPermissions(
      manifest.id,
      manifest.permissions,
      onConfirmPermission
    );
    if (!authorized) {
      throw new Error(`Installation aborted: permissions declined for extension "${manifest.displayName}"`);
    }

    // 3. Register as installed package
    const pkg: LocalPackage = {
      manifest,
      installedAt: Date.now(),
      status: 'installed',
    };

    this.installedPackages.set(manifest.id, pkg);

    // Track analytics for installation
    const analytics = this.getOrCreateAnalytics(manifest.id);
    analytics.totalInstalls += 1;
    analytics.activeInstalls += 1;

    return pkg;
  }

  /**
   * Activates/enables the extension package
   */
  public enablePackage(id: string): void {
    const pkg = this.installedPackages.get(id);
    if (!pkg) {
      throw new Error(`Unable to enable: extension "${id}" is not installed.`);
    }

    // Solve dependencies
    const nodes: DependencyNode[] = Array.from(this.installedPackages.values()).map(p => ({
      id: p.manifest.id,
      version: p.manifest.version,
      dependencies: p.manifest.dependencies || {},
    }));

    const allRecords = nodes.reduce((acc, curr) => {
      acc[acc.length] = curr;
      return acc;
    }, [] as DependencyNode[]).reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {} as Record<string, DependencyNode>);

    // Resolve topological execution
    this.resolver.resolve([{ id: pkg.manifest.id, version: pkg.manifest.version, dependencies: pkg.manifest.dependencies || {} }], allRecords);

    pkg.status = 'active';

    const ext: Extension = {
      manifest: pkg.manifest,
      contributions: {}, // Contribution SDK bindings
      enabled: true,
      state: 'enabled',
    };

    this.activeExtensions.set(id, ext);
  }

  /**
   * Disables the active package extension
   */
  public disablePackage(id: string): void {
    const pkg = this.installedPackages.get(id);
    if (pkg) {
      pkg.status = 'installed';
    }
    const ext = this.activeExtensions.get(id);
    if (ext) {
      ext.enabled = false;
      ext.state = 'disabled';
    }
  }

  /**
   * Upgrades/updates an installed package
   */
  public async updatePackage(
    newManifestPayload: any,
    onConfirmPermission?: (extId: string, perm: any) => Promise<boolean>
  ): Promise<LocalPackage> {
    const manifest = newManifestPayload as ExtensionManifest;
    const oldPkg = this.installedPackages.get(manifest.id);

    if (oldPkg) {
      // Record historical rollback version
      const history = this.rollbacksHistory.get(manifest.id) || [];
      history.push(JSON.stringify(oldPkg.manifest));
      this.rollbacksHistory.set(manifest.id, history);
    }

    // Install upgraded manifest
    return this.installPackage(newManifestPayload, onConfirmPermission);
  }

  /**
   * Rolls back package to its previous installed version
   */
  public rollbackPackage(id: string): LocalPackage {
    const history = this.rollbacksHistory.get(id) || [];
    if (history.length === 0) {
      throw new Error(`No rollback history available for extension "${id}"`);
    }

    const previousManifestJson = history.pop()!;
    const previousManifest = JSON.parse(previousManifestJson) as ExtensionManifest;
    this.rollbacksHistory.set(id, history);

    const pkg: LocalPackage = {
      manifest: previousManifest,
      installedAt: Date.now(),
      status: 'installed',
    };

    this.installedPackages.set(id, pkg);
    return pkg;
  }

  /**
   * Uninstalls/removes a local package completely
   */
  public uninstallPackage(id: string): void {
    this.disablePackage(id);
    this.installedPackages.delete(id);
    this.rollbacksHistory.delete(id);

    // Track analytics for uninstall
    const analytics = this.analyticsStore.get(id);
    if (analytics) {
      analytics.activeInstalls = Math.max(0, analytics.activeInstalls - 1);
      analytics.uninstallsCount += 1;
    }
  }

  /**
   * Repairs a broken local package configuration
   */
  public repairPackage(id: string): void {
    const pkg = this.installedPackages.get(id);
    if (!pkg) {
      throw new Error(`Repair failed: extension "${id}" is not installed.`);
    }
    // Re-verify digital signature and reset status
    const isValid = this.validator.validateManifest(pkg.manifest).valid;
    pkg.status = isValid ? 'installed' : 'broken';
  }

  public getInstalledPackage(id: string): LocalPackage | undefined {
    return this.installedPackages.get(id);
  }

  public listInstalledPackages(): LocalPackage[] {
    return Array.from(this.installedPackages.values());
  }

  /**
   * Exports installed packages collection metadata to JSON
   */
  public exportCollection(): string {
    const manifests = Array.from(this.installedPackages.values()).map(p => p.manifest);
    return JSON.stringify(manifests);
  }

  /**
   * Imports and installs a collection of package manifests offline
   */
  public async importCollection(
    json: string,
    onConfirmPermission?: (extId: string, perm: any) => Promise<boolean>
  ): Promise<LocalPackage[]> {
    const manifests = JSON.parse(json) as ExtensionManifest[];
    const imported: LocalPackage[] = [];

    for (const m of manifests) {
      const pkg = await this.installPackage(m, onConfirmPermission);
      imported.push(pkg);
    }

    return imported;
  }

  // ==========================================
  // PHASE 7: PUBLISHING PIPELINE IMPLEMENTATION
  // ==========================================

  public async packageExtension(manifest: ExtensionManifest): Promise<string> {
    const check = this.validator.validateManifest(manifest);
    if (!check.valid) {
      throw new Error(`Packaging validation failed: ${check.errors?.join(', ')}`);
    }
    // Simulated zip archive payload return
    return JSON.stringify({ manifest, files: ['dist/bundle.js', 'assets/icon.png'], packagedAt: Date.now() });
  }

  public async validateExtension(payload: any): Promise<{ valid: boolean; errors?: string[] }> {
    return this.validator.validateManifest(payload);
  }

  public signExtension(manifest: ExtensionManifest): string {
    const sig = this.validator.getSignatureService().signManifest(manifest);
    manifest.signature = sig;
    return sig;
  }

  public publishExtension(manifest: ExtensionManifest): void {
    const check = this.validator.validateManifest(manifest);
    if (!check.valid) {
      throw new Error(`Cannot publish unverified extension: ${check.errors?.join(', ')}`);
    }
    this.onlineDatabase.set(manifest.id, {
      id: manifest.id,
      name: manifest.name,
      displayName: manifest.displayName,
      description: manifest.description,
      version: manifest.version,
      category: manifest.category,
      downloads: 0,
      rating: 5.0,
      changelog: [`v${manifest.version}: Initial production-ready version.`],
      screenshots: manifest.screenshots || [],
      metadata: manifest,
    });
  }

  public deprecateExtension(id: string, notice: string): void {
    const ext = this.onlineDatabase.get(id);
    if (!ext) {
      throw new Error(`Extension "${id}" not found in online marketplace.`);
    }
    ext.isDeprecated = true;
    ext.deprecationNotice = notice;
  }

  // ==========================================
  // PHASE 8: MARKETPLACE ADMINISTRATION & MODERATION
  // ==========================================

  public submitModerationReport(report: Omit<MarketplaceModerationReport, 'timestamp' | 'status'>): void {
    const fullReport: MarketplaceModerationReport = {
      ...report,
      timestamp: Date.now(),
      status: 'pending',
    };
    this.moderationReports.set(report.id, fullReport);
  }

  public getModerationReports(): MarketplaceModerationReport[] {
    return Array.from(this.moderationReports.values());
  }

  public resolveModerationReport(id: string, status: 'reviewed' | 'resolved'): void {
    const r = this.moderationReports.get(id);
    if (r) {
      r.status = status;
    }
  }

  public setFeaturedExtension(id: string, featured: boolean): void {
    if (featured) {
      this.featuredExtensionIds.add(id);
    } else {
      this.featuredExtensionIds.delete(id);
    }
  }

  public getFeaturedExtensions(): string[] {
    return Array.from(this.featuredExtensionIds);
  }

  public addSecurityAdvisory(extensionId: string, advisory: string): void {
    const list = this.securityAdvisories.get(extensionId) || [];
    list.push(advisory);
    this.securityAdvisories.set(extensionId, list);
  }

  public getSecurityAdvisories(extensionId: string): string[] {
    return this.securityAdvisories.get(extensionId) || [];
  }

  public getAnalytics(extensionId: string): MarketplaceAnalytics {
    return this.getOrCreateAnalytics(extensionId);
  }

  private getOrCreateAnalytics(extensionId: string): MarketplaceAnalytics {
    let stat = this.analyticsStore.get(extensionId);
    if (!stat) {
      stat = {
        extensionId,
        totalInstalls: 0,
        activeInstalls: 0,
        uninstallsCount: 0,
        averageRating: 5.0,
      };
      this.analyticsStore.set(extensionId, stat);
    }
    return stat;
  }

  // ==========================================
  // ONLINE MARKETPLACE DESIGNS
  // ==========================================

  public async fetchOnlineMarketplaceMetadata(id: string): Promise<OnlineExtensionMeta> {
    const online = this.onlineDatabase.get(id);
    if (online) {
      return {
        id: online.id,
        downloads: online.downloads,
        rating: online.rating,
        reviews: [
          { author: 'Jules', stars: 5, comment: 'Phenomenal addition to our platform!' }
        ],
        verifiedPublisher: true,
        publisherName: 'RR Smart Studio',
        autoUpdateEnabled: true,
        screenshots: online.screenshots,
        changelog: online.changelog,
        category: online.category,
      };
    }
    return {
      id,
      downloads: 15300,
      rating: 4.8,
      reviews: [
        { author: 'Jules', stars: 5, comment: 'Phenomenal NLE timelines extension!' }
      ],
      verifiedPublisher: true,
      publisherName: 'RR Smart Studio',
      autoUpdateEnabled: true,
      category: 'plugin',
    };
  }
}
