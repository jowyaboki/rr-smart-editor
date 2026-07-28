import { assetLibrary } from '../services';

export const listAssetCollections = () => {
  return [
    { id: 'col-favs', name: 'Smart Collection: Favorites', isSmart: true, favoriteAssetIds: [] }
  ];
};
