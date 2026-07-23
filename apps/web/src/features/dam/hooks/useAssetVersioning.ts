import { useDAMStore } from '../store/damStore';
import { assetLibrary } from '../services';

export function useAssetVersioning(assetId: string) {
  const store = useDAMStore();

  const addNewVersion = (version: string, url: string, checksum: string, size: number) => {
    const asset = assetLibrary.getAsset(assetId);
    if (asset) {
      assetLibrary.versions.createVersion(asset, { version, url, checksum, size });
    }
  };

  const rollbackVersion = (version: string) => {
    const asset = assetLibrary.getAsset(assetId);
    if (asset) {
      assetLibrary.versions.restoreVersion(asset, version);
    }
  };

  const getVersionsList = () => {
    const asset = assetLibrary.getAsset(assetId);
    return asset ? asset.versions : [];
  };

  return {
    addNewVersion,
    rollbackVersion,
    getVersionsList,
  };
}
