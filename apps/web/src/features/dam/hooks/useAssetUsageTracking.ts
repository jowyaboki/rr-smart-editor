import { assetLibrary } from '../services';

export function useAssetUsageTracking(assetId: string) {
  const registerClipUsage = (projectId: string, clipId: string) => {
    const asset = assetLibrary.getAsset(assetId);
    if (asset) {
      assetLibrary.usage.trackUsage(asset, projectId, clipId);
    }
  };

  const getUsageDetails = () => {
    const asset = assetLibrary.getAsset(assetId);
    return asset ? asset.usage : null;
  };

  return {
    registerClipUsage,
    getUsageDetails,
  };
}
