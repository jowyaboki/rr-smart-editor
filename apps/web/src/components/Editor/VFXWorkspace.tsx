import React, { useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Tooltip, IconButton, Chip } from '@mui/material';
import {
  AutoAwesome as FXIcon,
  Favorite as FavIcon,
  FavoriteBorder as NoFavIcon,
  DragIndicator as DragIcon,
  ChevronRight as ArrowIcon
} from '@mui/icons-material';

interface VFXPreset {
  id: string;
  name: string;
  category: 'Color' | 'Blur' | 'Distort' | 'Transition';
  desc: string;
}

export const VFXWorkspace: React.FC = () => {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['fx-1', 'fx-3']);

  const presets: VFXPreset[] = [
    { id: 'fx-1', name: 'Cinematic Rec.709 LUT', category: 'Color', desc: 'Saturates high tones and maps colors with high adaptivity' },
    { id: 'fx-2', name: 'Gaussian Focus Blur', category: 'Blur', desc: 'Adds a soft professional background lens bokeh blur' },
    { id: 'fx-3', name: 'Chroma Key Screen Greener', category: 'Distort', desc: 'Replaces uniform neon backgrounds with alpha mask channels' },
    { id: 'fx-4', name: 'Whip Pan Transition', category: 'Transition', desc: 'High-speed directional motion camera pan' },
  ];

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filtered = presets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* 1. Effects Browser search */}
      <Box sx={{ p: 1 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter GPU effects and presets..."
          size="small"
          fullWidth
          InputProps={{
            sx: { fontSize: '0.72rem', color: '#ffffff', bgcolor: '#050b14' }
          }}
        />
      </Box>

      {/* 2. Horizontal effects flow chain sequence visualization */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1, display: 'block' }}>
          Active Filter Chain Order
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', py: 1 }}>
          <Chip label="Source Frame" size="small" sx={{ fontSize: '0.65rem', bgcolor: '#12203d' }} />
          <ArrowIcon style={{ fontSize: '10px', color: '#94a3b8' }} />
          <Chip label="Rec.709 LUT" size="small" onDelete={() => {}} sx={{ fontSize: '0.65rem', bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', borderColor: '#00f0ff', border: '1px solid' }} />
          <ArrowIcon style={{ fontSize: '10px', color: '#94a3b8' }} />
          <Chip label="Green Screen" size="small" onDelete={() => {}} sx={{ fontSize: '0.65rem', bgcolor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', borderColor: '#ec4899', border: '1px solid' }} />
          <ArrowIcon style={{ fontSize: '10px', color: '#94a3b8' }} />
          <Chip label="Display output" size="small" sx={{ fontSize: '0.65rem', bgcolor: '#12203d' }} />
        </Box>
      </Box>

      {/* 3. Favorite/General Effects List */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FXIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Effects List & Presets
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {filtered.map(effect => {
            const isFav = favorites.includes(effect.id);
            return (
              <ListItem
                key={effect.id}
                dense
                sx={{
                  bgcolor: 'rgba(255,255,255,0.01)',
                  mb: 1,
                  borderRadius: '4px',
                  border: '1px solid #1b2f54',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0,240,255,0.03)' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                  <DragIcon style={{ fontSize: '14px', color: '#94a3b8', cursor: 'grab' }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {effect.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.58rem', display: 'block' }}>
                      {effect.category} • {effect.desc}
                    </Typography>
                  </Box>
                </Box>

                <Tooltip title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton size="small" onClick={() => toggleFavorite(effect.id)} sx={{ color: isFav ? '#f59e0b' : '#94a3b8' }}>
                    {isFav ? <FavIcon style={{ fontSize: '14px' }} /> : <NoFavIcon style={{ fontSize: '14px' }} />}
                  </IconButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};
