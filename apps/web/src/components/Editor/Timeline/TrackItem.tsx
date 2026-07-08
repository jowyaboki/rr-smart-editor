import React from 'react';
import { Box, Typography } from '@mui/material';
import { Track } from '../../../store/useTimelineStore';
import ClipItem from './ClipItem';

interface TrackItemProps {
  track: Track;
  zoom: number;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, zoom }) => {
  return (
    <Box sx={{ display: 'flex', height: 60, borderBottom: '1px solid #333' }}>
      <Box sx={{ width: 150, p: 1, borderRight: '1px solid #333', flexShrink: 0, bgcolor: 'background.paper' }}>
        <Typography variant="caption">{track.name}</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {track.clips.map((clip) => (
          <ClipItem key={clip.id} clip={clip} zoom={zoom} />
        ))}
      </Box>
    </Box>
  );
};

export default TrackItem;
