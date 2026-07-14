import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';

export const StatusBar: React.FC = () => {
  const { playheadFrame, zoom, selectedClipIds } = useTimelineStore();

  return (
    <Box sx={{ p: 0.5, px: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#102031', color: 'white', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
      <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />}>
        <Typography variant="caption">Playhead: {playheadFrame}f</Typography>
        <Typography variant="caption">Zoom: {Math.round(zoom * 100)}%</Typography>
        <Typography variant="caption">Selected: {selectedClipIds.length}</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Typography variant="caption">1920x1080 | 30fps</Typography>
      </Stack>
    </Box>
  );
};
