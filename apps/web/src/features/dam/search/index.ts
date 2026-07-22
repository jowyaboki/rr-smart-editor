import { assetLibrary } from '../services';

export const runSmartSearch = (query: string, fileType?: string) => {
  const assets = assetLibrary.listAssets();
  return assetLibrary.searchService.search(assets, query, { fileType });
};
