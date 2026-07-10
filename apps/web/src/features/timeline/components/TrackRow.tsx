import React from 'react';
import { Box, Typography } from '@mui/material';
import { TimelineTrack } from '@ai-video-editor/shared';
import { ClipView } from './ClipView';
import { useTimelineStore } from '../store/timelineStore';
import { TimelineTransitionBlock } from '@/features/transitions/components/TimelineTransitionBlock';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';

interface TrackRowProps {
  track: TimelineTrack;
  zoom: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, zoom }) => {
  const { instances } = useTransitionStore();
  const trackTransitions = instances.filter(i => i.trackId === track.id);

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
          {trackTransitions.map(instance => (
            <TimelineTransitionBlock key={instance.id} instance={instance} zoom={zoom} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
