import { assetLibrary } from '../services';

export const rollBackAssetVersion = (assetId: string, version: string) => {
  const asset = assetLibrary.getAsset(assetId);
  if (asset) {
    assetLibrary.versions.restoreVersion(asset, version);
  }
};
