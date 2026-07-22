import { assetLibrary } from '../services';

export const updateAssetKeywords = (assetId: string, text: string) => {
  const asset = assetLibrary.getAsset(assetId);
  if (asset) {
    const keywords = assetLibrary.metadata.extractAIKeywords(text);
    assetLibrary.metadata.updateMetadata(asset, { keywords });
  }
};
