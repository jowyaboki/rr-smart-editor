import { useEffect } from 'react';
import { useMediaStore } from '../store/mediaStore';

export const useMedia = () => {
  const { assets, loading, error, fetchMedia, importAssets, removeAsset, toggleFavorite, setSearch, setFilters, search, filters } = useMediaStore();

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = filters.favorite ? asset.favorite : true;
    const matchesType = filters.type && filters.type.length > 0 ? filters.type.includes(asset.type) : true;
    return matchesSearch && matchesFavorite && matchesType;
  });

  return {
    assets: filteredAssets,
    loading,
    error,
    importAssets,
    removeAsset,
    toggleFavorite,
    setSearch,
    setFilters,
  };
};
