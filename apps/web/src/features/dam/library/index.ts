import { assetLibrary } from '../services';

export const listLibraryAssets = () => {
  return assetLibrary.listAssets();
};
