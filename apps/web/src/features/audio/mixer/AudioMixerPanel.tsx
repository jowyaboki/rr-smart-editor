import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  GraphicEq as MeterIcon
} from '@mui/icons-material';
import { useAudioStore } from '../store/audioStore';

export const AudioMixerPanel: React.FC = () => {
  const { tracks, masterVolume, setMasterVolume, updateTrack } = useAudioStore();

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, height: '100%', overflowX: 'auto' }}>
      {/* Master Fader */}
      <Paper sx={{ p: 2, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#1a1a1a' }}>
        <Typography variant="caption" sx={{ mb: 2 }}>MASTER</Typography>
        <Box sx={{ height: 200 }}>
          <Slider
            orientation="vertical"
            value={masterVolume * 100}
            onChange={(_, val) => setMasterVolume((val as number) / 100)}
            valueLabelDisplay="auto"
          />
        </Box>
        <VolumeIcon sx={{ mt: 2, color: 'primary.main' }} />
      </Paper>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      {/* Track Faders */}
      {tracks.map(track => (
        <Paper key={track.id} sx={{ p: 2, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" noWrap sx={{ mb: 2, width: 60, textAlign: 'center' }}>{track.name}</Typography>
          <Box sx={{ height: 200 }}>
            <Slider
              orientation="vertical"
              value={track.volume * 100}
              onChange={(_, val) => updateTrack(track.id, { volume: (val as number) / 100 })}
              color={track.isMuted ? 'error' : 'primary'}
            />
          </Box>
          <MeterIcon sx={{ mt: 2, opacity: track.isMuted ? 0.3 : 1 }} />
        </Paper>
      ))}
    </Box>
  );
};
