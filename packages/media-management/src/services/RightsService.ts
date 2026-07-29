import { MediaAsset, MediaRights, License } from '../types';
import { globalMediaManagementPluginRegistry } from '../plugins';

export class RightsService {
  public assignLicense(asset: MediaAsset, license: License): MediaRights {
    const rights: MediaRights = {
      assetId: asset.id,
      license,
      approvalStatus: 'pending',
      updatedAt: new Date().toISOString(),
    };

    // Auto clear if no expiration date or expiration date is in the future
    if (!license.expirationDate) {
      rights.approvalStatus = 'cleared';
    } else {
      const exp = new Date(license.expirationDate).getTime();
      const now = Date.now();
      rights.approvalStatus = exp > now ? 'cleared' : 'expired';
    }

    asset.rights = rights;
    asset.updatedAt = new Date().toISOString();

    return rights;
  }

  public async validateTerritoryUsage(asset: MediaAsset, territory: string): Promise<{ cleared: boolean; reason?: string }> {
    // 1. Run plugin validation adapters if registered
    const providers = globalMediaManagementPluginRegistry.listRightsProviders();
    for (const p of providers) {
      const res = await p.validateRights(asset, territory);
      if (!res.cleared) return res;
    }

    // 2. Default standard territorial clearance check
    const rights = asset.rights;
    if (!rights) {
      return { cleared: true }; // Unlicensed assets are clear by default or internal review is disabled
    }

    if (rights.approvalStatus === 'expired') {
      return { cleared: false, reason: 'License has expired.' };
    }

    const allowed = rights.license.allowedTerritories;
    if (allowed.length > 0 && !allowed.includes(territory)) {
      return {
        cleared: false,
        reason: `Territorial restriction: Asset not cleared for usage in '${territory}' (Allowed: ${allowed.join(', ')})`,
      };
    }

    return { cleared: true };
  }
}

export const globalRightsService = new RightsService();
