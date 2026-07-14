import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  GraphicEq as SoloIcon
} from '@mui/icons-material';
import { AudioTrack } from '@ai-video-editor/shared';
import { useAudioStore } from '../store/audioStore';

interface AudioTrackViewProps {
  track: AudioTrack;
  zoom: number;
}

export const AudioTrackView: React.FC<AudioTrackViewProps> = ({ track, zoom }) => {
  const { updateTrack } = useAudioStore();

  return (
    <Box sx={{ display: 'flex', borderBottom: '1px solid #333', minHeight: 80 }}>
      <Box sx={{ width: 200, bgcolor: 'background.paper', p: 1, borderRight: '1px solid #333', flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{track.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
          <IconButton
            size="small"
            color={track.isMuted ? 'error' : 'default'}
            onClick={() => updateTrack(track.id, { isMuted: !track.isMuted })}
          >
            <MuteIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            color={track.isSolo ? 'secondary' : 'default'}
            onClick={() => updateTrack(track.id, { isSolo: !track.isSolo })}
          >
            <SoloIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: 'rgba(0,0,255,0.05)' }}>
        {track.clips.map(clip => (
          <Box
            key={clip.id}
            sx={{
              position: 'absolute',
              left: clip.startFrame * zoom,
              width: clip.durationFrames * zoom,
              height: 60,
              top: 10,
              bgcolor: 'rgba(100, 150, 255, 0.3)',
              border: '1px solid rgba(100, 150, 255, 0.6)',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            {/* Waveform Placeholder */}
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', px: 1 }}>
              <Box sx={{ width: '100%', height: '50%', borderBottom: '1px solid rgba(255,255,255,0.2)' }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
