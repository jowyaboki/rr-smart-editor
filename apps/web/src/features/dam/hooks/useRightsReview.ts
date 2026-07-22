import { assetLibrary } from '../services';

export function useRightsReview(assetId: string) {
  const checkRights = (territory?: string) => {
    const asset = assetLibrary.getAsset(assetId);
    if (!asset) return { authorized: false, reason: 'ASSET_NOT_FOUND' };
    return assetLibrary.rights.isAuthorized(asset.license, territory);
  };

  const getLicenseDetails = () => {
    const asset = assetLibrary.getAsset(assetId);
    return asset ? asset.license : null;
  };

  return {
    checkRights,
    getLicenseDetails,
  };
}
