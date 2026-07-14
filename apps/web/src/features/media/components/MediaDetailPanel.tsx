import React from 'react';
import { Box, Typography, Divider, Chip, Stack } from '@mui/material';
import { useSelectedMedia } from '../hooks/useSelectedMedia';

export const MediaDetailPanel: React.FC = () => {
  const { selectedAsset } = useSelectedMedia();

  if (!selectedAsset) {
    return (
      <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #333', textAlign: 'center' }}>
        <Typography color="text.secondary">Select an asset to view details</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #333', bgcolor: 'background.paper', overflowY: 'auto' }}>
      <Typography variant="subtitle1" gutterBottom noWrap title={selectedAsset.name}>{selectedAsset.name}</Typography>
      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5}>
        <DetailItem label="Type" value={selectedAsset.type.toUpperCase()} />
        <DetailItem label="Size" value={`${(selectedAsset.size / 1024 / 1024).toFixed(2)} MB`} />
        {selectedAsset.width && <DetailItem label="Resolution" value={`${selectedAsset.width}x${selectedAsset.height}`} />}
        {selectedAsset.duration && <DetailItem label="Duration" value={`${selectedAsset.duration.toFixed(2)}s`} />}
        <DetailItem label="Created" value={new Date(selectedAsset.createdAt).toLocaleDateString()} />
      </Stack>

      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Tags</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedAsset.tags.map(tag => (
          <Chip key={tag} label={tag} size="small" />
        ))}
        {selectedAsset.tags.length === 0 && <Typography variant="caption" color="text.secondary">No tags</Typography>}
      </Box>
    </Box>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{value}</Typography>
  </Box>
);
