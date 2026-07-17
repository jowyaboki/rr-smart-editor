import { useMemo } from 'react';
import { useMediaStore } from '../store/mediaStore';
import { MediaAsset } from '../types';

export function useMediaBrowser() {
  const store = useMediaStore();

  // Optimized Search Index querying
  const filteredAssets = useMemo(() => {
    let result = [...store.assets];

    // 1. Filter by collection folder
    if (store.selectedCollectionId && store.selectedCollectionId !== 'all') {
      result = result.filter(asset => asset.collectionId === store.selectedCollectionId);
    }

    // 2. Filter by type (video / audio / image)
    if (store.selectedType) {
      result = result.filter(asset => asset.type === store.selectedType);
    }

    // 3. Search query indexing: query filenames, tags, codecs, metadata resolutions
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      result = result.filter(asset => {
        const matchName = asset.filename.toLowerCase().includes(q);
        const matchCodec = asset.metadata.codec?.toLowerCase().includes(q);
        const matchTags = asset.metadata.embeddedMetadata?.encoder?.toLowerCase().includes(q);
        return matchName || matchCodec || matchTags;
      });
    }

    return result;
  }, [store.assets, store.searchQuery, store.selectedCollectionId, store.selectedType]);

  const activeJobs = useMemo(() => {
    return Object.values(store.jobs).filter(j => j.status === 'processing' || j.status === 'queued');
  }, [store.jobs]);

  return {
    assets: filteredAssets,
    collections: store.collections,
    activeJobs,

    // Select selectors
    selectedCollectionId: store.selectedCollectionId,
    selectedType: store.selectedType,
    searchQuery: store.searchQuery,

    // Setters
    setSearchQuery: store.setSearchQuery,
    selectCollection: store.selectCollection,
    selectType: store.selectType,
    importFile: store.importFile,
    createCollection: store.createCollection,
  };
}
