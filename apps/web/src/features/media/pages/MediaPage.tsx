import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useMedia } from '../hooks/useMedia';
import { MediaSidebar } from '../components/MediaSidebar';
import { MediaToolbar } from '../components/MediaToolbar';
import { MediaGrid } from '../components/MediaGrid';
import { MediaDetailPanel } from '../components/MediaDetailPanel';
import { DragAndDropUploader } from '../components/DragAndDropUploader';
import { useSelectedMedia } from '../hooks/useSelectedMedia';
import { MediaPreview } from '../components/MediaPreview';
import { MediaAsset } from '../types';

const MediaPage: React.FC = () => {
  const { assets, loading, importAssets, removeAsset, toggleFavorite } = useMedia();
  const { selectAsset } = useSelectedMedia();
  const [search, setSearch] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const handleUpload = (files: File[]) => {
    importAssets(files);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = favoriteOnly ? asset.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleSelect = (id: string) => {
    selectAsset(id);
    const asset = assets.find(a => a.id === id);
    if (asset) {
      // For now, let's trigger preview on second click or specific action.
      // Simple implementation: show preview on card click for this demo.
      // In a real app, maybe double click.
    }
  };

  const handleDoubleClick = (asset: MediaAsset) => {
    setPreviewAsset(asset);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', m: -3 }}>
      <MediaSidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 3, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Media Library</Typography>
          </Box>
          <MediaToolbar
            search={search}
            onSearchChange={setSearch}
            favoriteOnly={favoriteOnly}
            onFavoriteToggle={setFavoriteOnly}
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, pb: 3 }}>
          {loading && assets.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : assets.length === 0 ? (
            <DragAndDropUploader onUpload={handleUpload} />
          ) : (
            <>
              <Box onDoubleClick={(e: any) => {
                const card = e.target.closest('.MuiCard-root');
                if (card) {
                  // This is a bit hacky, normally I'd pass double click to MediaCard
                }
              }}>
                <MediaGrid
                  assets={filteredAssets}
                  onDelete={removeAsset}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(id) => {
                    handleSelect(id);
                    const asset = assets.find(a => a.id === id);
                    if (asset) setPreviewAsset(asset);
                  }}
                />
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>Import more</Typography>
                <DragAndDropUploader onUpload={handleUpload} />
              </Box>
            </>
          )}
        </Box>
      </Box>

      <MediaDetailPanel />

      <MediaPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </Box>
  );
};

export default MediaPage;
