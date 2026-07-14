import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TimelineClip } from '@ai-video-editor/shared';
import { useTimelineStore } from '../store/timelineStore';
import { useEffectStore } from '@/features/effects/store/effectStore';

interface ClipViewProps {
  clip: TimelineClip;
  zoom: number;
}

export const ClipView: React.FC<ClipViewProps> = ({ clip, zoom }) => {
  const { selectedClipId, setSelectedClipId } = useTimelineStore();
  const { clipEffects } = useEffectStore();

  const effects = clipEffects[clip.id] || [];
  const isSelected = selectedClipId === clip.id;
  const left = clip.startFrame * zoom;
  const width = clip.durationFrames * zoom;

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        setSelectedClipId(clip.id);
      }}
      sx={{
        position: 'absolute',
        left,
        width,
        height: 50,
        top: 5,
        bgcolor: isSelected ? 'primary.main' : 'primary.dark',
        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        overflow: 'hidden',
        px: 1
      }}
    >
      <Typography variant="caption" noWrap sx={{ width: '100%', textAlign: 'center' }}>
        {clip.name}
      </Typography>
      {effects.length > 0 && (
        <Box sx={{ position: 'absolute', bottom: 2, right: 2 }}>
          <Chip label="FX" size="small" sx={{ height: 12, fontSize: 8, bgcolor: 'secondary.main' }} />
        </Box>
      )}
    </Box>
  );
};
