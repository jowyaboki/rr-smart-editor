import React from 'react';
import { Box, Slider, IconButton, Stack, Typography } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
} from '@mui/icons-material';
import { useTimelineStore } from '../../../store/useTimelineStore';
import TrackItem from './TrackItem';
import Playhead from './Playhead';

const TimelineContainer: React.FC = () => {
  const { tracks, playhead, zoom, setZoom, setPlayhead } = useTimelineStore();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 150; // Subtract track header width
    if (x >= 0) {
      setPlayhead(Math.round(x / zoom));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption">Timeline</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ZoomOutIcon fontSize="small" />
          <Slider
            value={zoom}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(e, v) => setZoom(v as number)}
            sx={{ width: 100 }}
          />
          <ZoomInIcon fontSize="small" />
        </Stack>
      </Box>
      <Box
        sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}
        onClick={handleTimelineClick}
      >
        <Box sx={{ minWidth: '2000px', position: 'relative' }}>
          <Playhead playhead={playhead} zoom={zoom} />
          {tracks.map((track) => (
            <TrackItem key={track.id} track={track} zoom={zoom} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineContainer;
