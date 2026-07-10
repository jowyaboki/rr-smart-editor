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
      </Box>
    </Box>
  );
};

export default TimelineContainer;
