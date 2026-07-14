import React from 'react';
import { Box, Typography } from '@mui/material';
import { Track } from '../../../store/useTimelineStore';
import ClipItem from './ClipItem';

interface TrackItemProps {
  track: Track;
  zoom: number;
  visibleClipIds?: Set<string>;
}

const TrackItem: React.FC<TrackItemProps> = React.memo(({ track, zoom, visibleClipIds }) => {
  return (
    <Box sx={{ display: 'flex', height: 60, borderBottom: '1px solid #333', width: '100%' }}>
      <Box
        sx={{
          width: 150,
          p: 1,
          borderRight: '1px solid #333',
          flexShrink: 0,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          {track.name}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {track.clips.map((clip) => {
          // If we have visibleClipIds list, only render if clip is visible
          if (visibleClipIds && !visibleClipIds.has(clip.id)) {
            return null;
          }
          return <ClipItem key={clip.id} clip={clip} zoom={zoom} />;
        })}
      </Box>
    </Box>
  );
});

TrackItem.displayName = 'TrackItem';

export default TrackItem;
