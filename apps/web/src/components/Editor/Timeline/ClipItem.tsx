import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Clip, useTimelineStore } from '../../../store/useTimelineStore';

interface ClipItemProps {
  clip: Clip;
  zoom: number;
}

const ClipItem: React.FC<ClipItemProps> = ({ clip, zoom }) => {
  const updateClip = useTimelineStore((state) => state.updateClip);
  const left = clip.start * zoom;
  const width = clip.duration * zoom;
  const isDragging = useRef(false);
  const startX = useRef(0);
  const originalStart = useRef(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = (e.clientX - startX.current) / zoom;
    const newStart = Math.max(0, Math.round(originalStart.current + delta));
    updateClip(clip.id, { start: newStart });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    originalStart.current = clip.start;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    e.stopPropagation();
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        position: 'absolute',
        left,
        width,
        height: '80%',
        top: '10%',
        bgcolor: clip.type === 'video' ? 'primary.main' : 'secondary.main',
        borderRadius: 1,
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        px: 1,
        overflow: 'hidden',
        userSelect: 'none',
        '&:active': { cursor: 'grabbing' },
        '&:hover': {
          filter: 'brightness(1.1)',
        },
      }}
    >
      <Typography variant="caption" noWrap sx={{ color: 'white', fontWeight: 'bold', pointerEvents: 'none' }}>
        {clip.name}
      </Typography>
      {/* Resizer Handle */}
      <Box
        onMouseDown={(e) => {
          e.stopPropagation();
          const startW = clip.duration;
          const startX = e.clientX;
          const onMove = (me: MouseEvent) => {
            const dw = (me.clientX - startX) / zoom;
            updateClip(clip.id, { duration: Math.max(1, Math.round(startW + dw)) });
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 5,
          cursor: 'ew-resize',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
        }}
      />
    </Box>
  );
};

export default ClipItem;
