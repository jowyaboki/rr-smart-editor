import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MediaAsset } from '../types';

interface MediaPreviewProps {
  asset: MediaAsset | null;
  onClose: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  return (
    <Dialog open={!!asset} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {asset.name}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        {asset.type === 'video' ? (
          <video src={asset.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '70vh' }} />
        ) : asset.type === 'audio' ? (
          <audio src={asset.url} controls autoPlay />
        ) : (
          <img src={asset.url} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
        )}
      </DialogContent>
    </Dialog>
  );
};
