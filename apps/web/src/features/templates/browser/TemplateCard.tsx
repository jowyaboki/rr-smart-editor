import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Box, IconButton, Chip } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Person as AuthorIcon } from '@mui/icons-material';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onUse: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onToggleFavorite }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: 'grey.900' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {template.thumbnail ? (
            <CardMedia component="img" image={template.thumbnail} />
          ) : (
            <Typography variant="h6" color="grey.800">PREVIEW</Typography>
          )}
        </Box>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
          onClick={() => onToggleFavorite(template.id)}
        >
          {template.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon sx={{ color: 'white' }} />}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{template.metadata.name}</Typography>
          <Typography variant="caption" color="text.secondary">v{template.metadata.version}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
          {template.metadata.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <AuthorIcon sx={{ fontSize: 12 }} />
          <Typography variant="caption">{template.metadata.author}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={template.metadata.category} size="small" variant="outlined" />
        </Box>
      </CardContent>
      <CardActions>
        <Button fullWidth variant="contained" size="small" onClick={() => onUse(template.id)}>
          Use Template
        </Button>
      </CardActions>
    </Card>
  );
};
