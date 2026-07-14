import { useMediaStore } from '../store/mediaStore';

export const useSelectedMedia = () => {
  const { selectedAssetId, selectAsset, assets } = useMediaStore();
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

  return {
    selectedAsset,
    selectAsset,
  };
};
