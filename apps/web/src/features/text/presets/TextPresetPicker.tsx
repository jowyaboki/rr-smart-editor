import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useTextStore } from '../store/textStore';

export const TextPresetPicker: React.FC = () => {
  const presets = [
    { id: 'h1', name: 'Heading', style: { fontSize: 72, fontWeight: 800 } },
    { id: 'body', name: 'Body', style: { fontSize: 24, fontWeight: 400 } },
    { id: 'caption', name: 'Caption', style: { fontSize: 16, fontWeight: 300 } }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Text Presets</Typography>
      <Grid container spacing={1}>
        {presets.map(p => (
          <Grid item xs={6} key={p.id}>
            <Paper
              sx={{
                p: 2, cursor: 'pointer', textAlign: 'center',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Typography variant="body2">{p.name}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
