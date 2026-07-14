import React from 'react';
import { Box, Paper } from '@mui/material';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { useAudioStore } from '@/features/audio/store/audioStore';
import { TrackRow } from '@/features/timeline/components/TrackRow';
import { AudioTrackView } from '@/features/audio/components/AudioTrackView';
import { TimelineHeader } from '@/features/timeline/components/TimelineHeader';

const TimelineContainer: React.FC = () => {
  const { tracks: visualTracks, zoom } = useTimelineStore();
  const { tracks: audioTracks } = useAudioStore();
import { Box, Slider, Stack, Typography } from '@mui/material';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { useTimelineVirtualization } from '../../../features/performance/hooks/useTimelineVirtualization';
import TrackItem from './TrackItem';
import Playhead from './Playhead';

const TimelineContainer: React.FC = () => {
  const { tracks, playhead, zoom, setZoom, setPlayhead } = useTimelineStore();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only move playhead if we click in the header/ruler space (not on clips)
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111' }}>
      <TimelineHeader />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Visual Tracks */}
        {visualTracks.map(track => (
          <TrackRow key={track.id} track={track} zoom={zoom} />
        ))}

        {/* Audio Tracks */}
        {audioTracks.map(track => (
          <AudioTrackView key={track.id} track={track} zoom={zoom} />
        ))}
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Timeline
          {visibleRanges.virtualizationSavingsPercentage > 0 && (
            <Typography variant="caption" color="success.main" sx={{ ml: 1, fontWeight: 'normal' }}>
              ({visibleRanges.virtualizationSavingsPercentage}% virtualized)
            </Typography>
          )}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ZoomOutIcon fontSize="small" />
          <Slider
            value={zoom}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(e, v) => setZoom(v as number)}
            sx={{ width: 100 }}
          />
          <ZoomInIcon fontSize="small" />
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
