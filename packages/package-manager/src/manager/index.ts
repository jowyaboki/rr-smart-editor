import { ExtensionManifest, Extension } from '@ai-video-editor/extension-sdk';
import { LocalPackage, DependencyNode, OnlineExtensionMeta } from '../types';
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
  // FUTURE ONLINE MARKETPLACE DESIGNS
  // ==========================================

  public async fetchOnlineMarketplaceMetadata(id: string): Promise<OnlineExtensionMeta> {
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
    };
  }
}
