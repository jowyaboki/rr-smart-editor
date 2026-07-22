import { assetLibrary } from '../services';

export const checkAssetCommercialRights = (assetId: string) => {
  const asset = assetLibrary.getAsset(assetId);
  if (!asset) return false;
  return asset.license.commercialUse;
};
