import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { TimelineClip } from '../types';
import { useTimelineStore } from '../store/timelineStore';
import { KeyboardArrowDown as ExpandIcon, KeyboardArrowUp as CollapseIcon } from '@mui/icons-material';

interface ClipViewProps {
  clip: TimelineClip;
  zoom: number;
}

export const ClipView: React.FC<ClipViewProps> = ({ clip, zoom }) => {
  const { updateClip, selectClip, toggleClipExpansion } = useTimelineStore();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const originalStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    originalStart.current = clip.startFrame;
    selectClip(clip.id, e.ctrlKey);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = (e.clientX - startX.current) / zoom;
    updateClip(clip.id, { startFrame: Math.max(0, Math.round(originalStart.current + delta)) });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        position: 'absolute',
        left: clip.startFrame * zoom,
        width: clip.durationInFrames * zoom,
        height: '80%',
        top: '10%',
        bgcolor: clip.type === 'audio' ? 'secondary.main' : 'primary.main',
        borderRadius: 1,
        border: clip.selected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        px: 1,
        overflow: 'hidden',
        userSelect: 'none',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); toggleClipExpansion(clip.id); }}
        sx={{ p: 0, color: 'white' }}
      >
        {(clip as any).expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
      </IconButton>
      <Typography variant="caption" noWrap sx={{ color: 'white', fontWeight: 'bold', ml: 0.5 }}>
        {clip.label}
      </Typography>
      {/* Resizer */}
      <Box
        onMouseDown={(e) => {
          e.stopPropagation();
          const startD = clip.durationInFrames;
          const startX = e.clientX;
          const onMove = (me: MouseEvent) => {
            const dd = (me.clientX - startX) / zoom;
            updateClip(clip.id, { durationInFrames: Math.max(1, Math.round(startD + dd)) });
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
      />
    </Box>
  );
};
