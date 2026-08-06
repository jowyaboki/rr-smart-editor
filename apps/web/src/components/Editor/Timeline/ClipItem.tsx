import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Clip, useTimelineStore } from '../../../store/useTimelineStore';

interface ClipItemProps {
  clip: Clip;
  zoom: number;
}

const ClipItem: React.FC<ClipItemProps> = React.memo(({ clip, zoom }) => {
  const updateClip = useTimelineStore((state) => state.updateClip);
  const left = clip.start * zoom;
  const width = clip.duration * zoom;
  const isDragging = useRef(false);
  const startX = useRef(0);
  const originalStart = useRef(0);
  const [hovered, setHovered] = useState(false);

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

  // Determine colors based on design tokens & clip state
  const isVideo = clip.type === 'video';
  const accentColor = isVideo ? '#00f0ff' : '#ec4899';
  const borderCol = hovered ? accentColor : 'rgba(255,255,255,0.15)';
  const shadow = hovered ? `0 0 10px ${accentColor}88` : 'none';

  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'absolute',
        left,
        width,
        height: '84%',
        top: '8%',
        bgcolor: isVideo ? 'rgba(0, 240, 255, 0.15)' : 'rgba(236, 72, 153, 0.15)',
        borderRadius: '6px',
        border: `1.5px solid ${borderCol}`,
        boxShadow: shadow,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1,
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:active': { cursor: 'grabbing', transform: 'scale(0.99)' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography
          variant="caption"
          noWrap
          sx={{
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '0.72rem',
            pointerEvents: 'none',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {clip.name}
        </Typography>
        {/* Type Icon Badge */}
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.55rem',
            px: 0.5,
            py: 0.1,
            borderRadius: '2px',
            bgcolor: isVideo ? 'rgba(0, 240, 255, 0.3)' : 'rgba(236, 72, 153, 0.3)',
            color: '#ffffff',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {clip.type}
        </Typography>
      </Box>

      {/* Mock Waveform / Frame Strip representation */}
      <Box
        sx={{
          height: '6px',
          mt: 0.5,
          width: '100%',
          opacity: 0.5,
          display: 'flex',
          gap: '2px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {[...Array(Math.max(1, Math.floor(width / 8)))].map((_, idx) => (
          <Box
            key={idx}
            sx={{
              flexGrow: 1,
              height: `${(Math.sin(idx * 0.5) + 1.2) * 50}%`,
              bgcolor: isVideo ? '#00f0ff' : '#ec4899',
              borderRadius: '1px',
            }}
          />
        ))}
      </Box>

      {/* Mock Keyframe markers */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '4px',
          left: '10%',
          display: 'flex',
          gap: '3px',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ width: '4px', height: '4px', bgcolor: '#ffffff', transform: 'rotate(45deg)' }} />
        <Box sx={{ width: '4px', height: '4px', bgcolor: '#ffffff', transform: 'rotate(45deg)' }} />
      </Box>

      {/* Left Trim Handle */}
      <Box
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const origStart = clip.start;
          const origDur = clip.duration;
          const onMove = (me: MouseEvent) => {
            const dx = (me.clientX - startX) / zoom;
            const newStart = Math.max(0, Math.round(origStart + dx));
            const newDur = Math.max(1, Math.round(origDur - (newStart - origStart)));
            updateClip(clip.id, { start: newStart, duration: newDur });
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
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: 'ew-resize',
          bgcolor: hovered ? 'rgba(255,255,255,0.15)' : 'transparent',
          '&:hover': { bgcolor: accentColor, width: 8 },
        }}
      />

      {/* Right Trim Handle */}
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
          width: 6,
          cursor: 'ew-resize',
          bgcolor: hovered ? 'rgba(255,255,255,0.15)' : 'transparent',
          '&:hover': { bgcolor: accentColor, width: 8 },
        }}
      />
    </Box>
  );
});

ClipItem.displayName = 'ClipItem';

export default ClipItem;
