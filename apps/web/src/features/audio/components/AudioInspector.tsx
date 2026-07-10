import React from 'react';
import { Box, Typography, Slider, Switch, FormControlLabel } from '@mui/material';
import { useAudioStore } from '../store/audioStore';

interface AudioInspectorProps {
  clipId: string;
}

export const AudioInspector: React.FC<AudioInspectorProps> = ({ clipId }) => {
  const { tracks, updateClip } = useAudioStore();

  // Find the clip across all tracks
  let selectedTrackId = '';
  let clip = null;

  for (const track of tracks) {
    const found = track.clips.find(c => c.id === clipId);
    if (found) {
      clip = found;
      selectedTrackId = track.id;
      break;
    }
  }

  if (!clip) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Audio Properties</Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Volume</Typography>
        <Slider
          size="small"
          value={clip.volume * 100}
          min={0}
          max={200}
          onChange={(_, v) => updateClip(selectedTrackId, clipId, { volume: (v as number) / 100 })}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Pan</Typography>
        <Slider
          size="small"
          value={clip.pan * 100}
          min={-100}
          max={100}
          onChange={(_, v) => updateClip(selectedTrackId, clipId, { pan: (v as number) / 100 })}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Playback Speed</Typography>
        <Slider
          size="small"
          value={clip.playbackSpeed}
          min={0.1}
          max={4}
          step={0.1}
          onChange={(_, v) => updateClip(selectedTrackId, clipId, { playbackSpeed: v as number })}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};
