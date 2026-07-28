import { useDAMStore } from '../store/damStore';
import { assetLibrary } from '../services';

export function useDAMLibrary() {
  const store = useDAMStore();

  const registerNewAsset = (asset: any) => {
    assetLibrary.createAsset(asset);
    store.setAssets([
      ...store.assets,
      {
        id: asset.id,
        displayName: asset.name,
        category: asset.metadata.fileType,
        status: asset.approval.status,
        url: asset.url,
        isPinned: false,
      }
    ]);
  };

  const filteredAssets = store.assets.filter((asset) => {
    const matchesQuery = asset.displayName.toLowerCase().includes(store.searchQuery.toLowerCase());
    const matchesCategory = store.categoryFilter === 'all' || asset.category === store.categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return {
    assets: filteredAssets,
    searchQuery: store.searchQuery,
    categoryFilter: store.categoryFilter,
    loading: store.loading,
    setSearchQuery: store.setSearchQuery,
    setCategoryFilter: store.setCategoryFilter,
    togglePin: store.togglePin,
    registerNewAsset,
  };
}
