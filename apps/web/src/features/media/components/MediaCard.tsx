import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Tooltip } from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { MediaAsset } from '../types';

interface MediaCardProps {
  asset: MediaAsset;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ asset, onDelete, onToggleFavorite, onSelect }) => {
  return (
    <Card
      sx={{ height: '100%', cursor: 'pointer', position: 'relative' }}
      onClick={() => onSelect(asset.id)}
    >
      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
        {asset.thumbnail ? (
          <CardMedia
            component="img"
            image={asset.thumbnail}
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileIcon sx={{ fontSize: 40, color: 'grey.700' }} />
          </Box>
        )}
        <IconButton
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id); }}
        >
          {asset.favorite ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon sx={{ color: 'white' }} fontSize="small" />}
        </IconButton>
        {asset.type === 'video' && <PlayIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', opacity: 0.7 }} />}
      </Box>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 'bold' }}>{asset.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {asset.type.toUpperCase()} {asset.width ? `• ${asset.width}x${asset.height}` : ''} {asset.duration ? `• ${Math.round(asset.duration)}s` : ''}
        </Typography>
      </CardContent>
    </Card>
  );
};
