import React from 'react';
import { Box, Slider, Stack, Typography, Chip, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { useTimelineVirtualization } from '../../../features/performance/hooks/useTimelineVirtualization';
import TrackItem from './TrackItem';
import Playhead from './Playhead';

const TimelineContainer: React.FC = () => {
  const { tracks, playhead, zoom, setZoom, setPlayhead } = useTimelineStore();

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
            Multi-track timeline
          </Typography>
          {visibleRanges.virtualizationSavingsPercentage > 0 && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>
              ({visibleRanges.virtualizationSavingsPercentage}% Virtualized)
            </Typography>
          )}

          {/* Timeline markers / Chapter nodes */}
          <Chip label="Intro (0:00)" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#12203d', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.2)' }} />
          <Chip label="Chorus (0:15)" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#12203d', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' }} />
          <Chip label="Outro (1:00)" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#12203d', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }} />
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
