import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { StyleService } from '../services/StyleService';

export const CaptionStylePicker: React.FC = () => {
  const presets = StyleService.getBuiltInPresets();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Caption Styles</Typography>
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
