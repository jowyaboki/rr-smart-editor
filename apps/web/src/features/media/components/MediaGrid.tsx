import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { MediaAsset } from '../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  assets: MediaAsset[];
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ assets, onDelete, onToggleFavorite, onSelect }) => {
  if (assets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
        <Typography color="text.secondary">No assets found in this folder</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {assets.map((asset) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={asset.id}>
          <MediaCard
            asset={asset}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelect}
          />
        </Grid>
      ))}
    </Grid>
  );
};
