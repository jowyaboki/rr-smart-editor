import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { TimelineTrack, TimelineClip } from '../types';
import { ClipView } from './ClipView';
import { useTimelineStore } from '../store/timelineStore';
import { ExpandMore as ExpandIcon, ExpandLess as CollapseIcon } from '@mui/icons-material';

interface TrackRowProps {
  track: TimelineTrack;
  zoom: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, zoom }) => {
  const { toggleClipExpansion } = useTimelineStore();

  return (
    <Box sx={{ display: 'flex', borderBottom: '1px solid #333', minHeight: 60, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: 200, bgcolor: 'background.paper', p: 1, borderRight: '1px solid #333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{track.name}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, position: 'relative', minWidth: 2000, height: 60 }}>
          {track.clips.map(clip => (
            <ClipView key={clip.id} clip={clip} zoom={zoom} />
          ))}
        </Box>
      </Box>

      {/* Animation Lanes would go here if any clip is expanded */}
      {track.clips.some(c => (c as any).expanded) && (
        <Box sx={{ pl: 200, bgcolor: 'rgba(0,0,0,0.2)' }}>
          {track.clips.filter(c => (c as any).expanded).map(clip => (
            <Box key={`lanes-${clip.id}`} sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">Animation Lanes for {clip.label}</Typography>
              {/* Lane implementation */}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
