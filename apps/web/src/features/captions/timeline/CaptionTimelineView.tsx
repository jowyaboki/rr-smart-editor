import React from 'react';
import { Box, Typography } from '@mui/material';
import { CaptionTrack } from '@ai-video-editor/shared';
import { useCaptionStore } from '../store/captionStore';

interface CaptionTimelineViewProps {
  track: CaptionTrack;
  zoom: number;
}

export const CaptionTimelineView: React.FC<CaptionTimelineViewProps> = ({ track, zoom }) => {
  const { setSelectedSegment, selectedSegmentId } = useCaptionStore();

  return (
    <Box sx={{ position: 'relative', height: 40, bgcolor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #222' }}>
      {track.transcript.segments.map((seg) => (
        <Box
          key={seg.id}
          onClick={() => setSelectedSegment(seg.id)}
          sx={{
            position: 'absolute',
            left: seg.startFrame * zoom,
            width: (seg.endFrame - seg.startFrame) * zoom,
            height: 30,
            top: 5,
            bgcolor: selectedSegmentId === seg.id ? 'secondary.main' : 'secondary.dark',
            borderRadius: 0.5,
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          <Typography variant="caption" noWrap sx={{ fontSize: 10 }}>{seg.text}</Typography>
        </Box>
      ))}
    </Box>
  );
};
