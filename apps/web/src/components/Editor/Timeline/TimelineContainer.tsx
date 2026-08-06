import React from 'react';
import { Box, Slider, Stack, Typography, Chip, Tooltip, Avatar, AvatarGroup } from '@mui/material';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { useTimelineVirtualization } from '../../../features/performance/hooks/useTimelineVirtualization';
import { useWorkflowStore } from '../../../store/useWorkflowStore';
import TrackItem from './TrackItem';
import Playhead from './Playhead';

const TimelineContainer: React.FC = () => {
  const { tracks, playhead, zoom, setZoom, setPlayhead } = useTimelineStore();
  const { collaborators, viewportOwner } = useWorkflowStore();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'timeline-ruler') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 150; // Subtract track header width
      if (x >= 0) {
        setPlayhead(Math.round(x / zoom));
      }
    }
  };

  const { containerRef, visibleRanges } = useTimelineVirtualization(tracks, zoom);
  const totalHeight = tracks.length * 60;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. Integrated Multi-user Presence Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid #1b2f54',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#0d1527',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
            Multi-track Timeline
          </Typography>

          {/* Active viewport owner indicator */}
          {viewportOwner && (
            <Chip
              label={`Editing: ${viewportOwner}`}
              size="small"
              sx={{ height: 18, fontSize: '0.62rem', bgcolor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid #ec4899', fontWeight: 'bold' }}
            />
          )}

          {/* Connected collaborators list */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.62rem', pr: 1 }}>
              Active users:
            </Typography>
            {collaborators.map((collab) => (
              <Tooltip key={collab.id} title={`${collab.name} (At: ${collab.workspace})`}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: collab.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    border: '1.5px solid #0d1527',
                    cursor: 'pointer',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                    '&:hover': { transform: 'scale(1.15)', zIndex: 10 }
                  }}
                >
                  {collab.avatar}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <ZoomOutIcon fontSize="small" sx={{ color: '#94a3b8' }} />
          <Slider
            value={zoom}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(e, v) => setZoom(v as number)}
            sx={{ width: 100, color: '#00f0ff' }}
          />
          <ZoomInIcon fontSize="small" sx={{ color: '#94a3b8' }} />
        </Stack>
      </Box>

      <Box
        ref={containerRef}
        sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}
        onClick={handleTimelineClick}
      >
        <Box
          id="timeline-ruler"
          sx={{ minWidth: '2000px', height: totalHeight, position: 'relative' }}
        >
          <Playhead playhead={playhead} zoom={zoom} />

          {/* Rendering tiny multi-user collaborator playheads */}
          {collaborators.map((collab) => {
            if (collab.playhead === 0) return null;
            const collabLeft = 150 + collab.playhead * zoom; // Header width offset
            return (
              <Box
                key={collab.id}
                sx={{
                  position: 'absolute',
                  left: collabLeft,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  borderLeft: `1.5px dashed ${collab.color}`,
                  pointerEvents: 'none',
                  zIndex: 4,
                  opacity: 0.85
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 2,
                    left: '2px',
                    bgcolor: collab.color,
                    color: '#050b14',
                    px: 0.5,
                    borderRadius: '2px',
                    fontSize: '0.5rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
                  }}
                >
                  {collab.avatar} {collab.name.split(' ')[0]}
                </Box>
              </Box>
            );
          })}

          {visibleRanges.visibleTrackIndices.map((idx) => {
            const track = tracks[idx];
            if (!track) return null;
            return (
              <Box
                key={track.id}
                sx={{
                  position: 'absolute',
                  top: idx * 60,
                  left: 0,
                  right: 0,
                  height: 60,
                }}
              >
                <TrackItem
                  track={track}
                  zoom={zoom}
                  visibleClipIds={visibleRanges.visibleClipIds}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineContainer;
