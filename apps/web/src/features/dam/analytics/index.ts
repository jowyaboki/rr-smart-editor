import { assetLibrary } from '../services';

export const getAssetAnalytics = (assetId: string) => {
  const asset = assetLibrary.getAsset(assetId);
  return asset ? asset.usage : null;
};
