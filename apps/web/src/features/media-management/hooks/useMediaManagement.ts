import { useMemo } from 'react';
import { useMediaManagementStore } from '../store/mediaManagementStore';

export const useMediaManagement = () => {
  const store = useMediaManagementStore();

  const filteredAssets = useMemo(() => {
    let list = [...store.assets];

    // 1. Folder or Collection Filter
    if (store.selectedFolderId) {
      list = list.filter((a) => a.folderId === store.selectedFolderId);
    } else if (store.selectedCollectionId) {
      const col = store.collections.find((c) => c.id === store.selectedCollectionId);
      if (col) {
        list = list.filter((a) => col.assetIds.includes(a.id));
      }
    }

    // 2. Search query filter
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.metadata.aiGeneratedTags &&
            a.metadata.aiGeneratedTags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    // 3. Lifecycle Tier filter
    if (store.lifecycleFilter !== 'all') {
      list = list.filter((a) => a.lifecycleState === store.lifecycleFilter);
    }

    // 4. Rights filter
    if (store.rightsFilter !== 'all') {
      list = list.filter((a) => a.rights?.approvalStatus === store.rightsFilter);
    }

    return list;
  }, [
    store.assets,
    store.selectedFolderId,
    store.selectedCollectionId,
    store.collections,
    store.searchQuery,
    store.lifecycleFilter,
    store.rightsFilter,
  ]);

  return {
    ...store,
    filteredAssets,
  };
};

export default useMediaManagement;
