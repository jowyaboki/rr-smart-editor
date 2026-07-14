import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
  TextField
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { BrandPalette } from '@ai-video-editor/shared';

interface PaletteEditorProps {
  palette: BrandPalette;
  onUpdate: (updates: Partial<BrandPalette>) => void;
}

export const PaletteEditor: React.FC<PaletteEditorProps> = ({ palette, onUpdate }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">{palette.name}</Typography>
        <Box>
          <IconButton size="small"><CopyIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Primary</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, bgcolor: palette.primary, border: '1px solid white', borderRadius: 0.5 }} />
            <TextField
              size="small"
              value={palette.primary}
              onChange={(e) => onUpdate({ primary: e.target.value })}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Secondary</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, bgcolor: palette.secondary, border: '1px solid white', borderRadius: 0.5 }} />
            <TextField
              size="small"
              value={palette.secondary}
              onChange={(e) => onUpdate({ secondary: e.target.value })}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">Accents</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {palette.accent.map((color, i) => (
              <Box
                key={i}
                sx={{ width: 32, height: 32, bgcolor: color, border: '1px solid white', borderRadius: 0.5 }}
              />
            ))}
            <IconButton size="small" sx={{ border: '1px dashed grey' }}><AddIcon /></IconButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
