import React from 'react';
import { Box, Typography } from '@mui/material';
import { TransitionInstance, TransitionPreset } from '@ai-video-editor/shared';
import { useTransitionStore } from '../store/transitionStore';

interface TimelineTransitionBlockProps {
  instance: TransitionInstance;
  zoom: number;
}

export const TimelineTransitionBlock: React.FC<TimelineTransitionBlockProps> = ({ instance, zoom }) => {
  const { presets, selectedInstanceId, setSelectedInstanceId } = useTransitionStore();
  const preset = presets.find(p => p.id === instance.transitionId);

  const width = (preset?.defaultSettings.durationFrames || 30) * zoom;
  const left = instance.atFrame * zoom;
  const isSelected = selectedInstanceId === instance.id;

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        setSelectedInstanceId(instance.id);
      }}
      sx={{
        position: 'absolute',
        left: left - (width / 2), // Center the transition on the frame
        width,
        height: 24,
        top: 4,
        bgcolor: isSelected ? 'secondary.main' : 'rgba(255, 255, 255, 0.2)',
        borderRadius: 1,
        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.3)',
        }
      }}
    >
      <Typography variant="caption" sx={{ fontSize: 8, pointerEvents: 'none' }}>
        {preset?.name || 'Transition'}
      </Typography>
    </Box>
  );
};
