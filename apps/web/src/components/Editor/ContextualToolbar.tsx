import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { PropertyGrid } from '@ai-video-editor/ui';

// Contextual Quick Actions mapping based on active Selection type
export const ContextualToolbar: React.FC = () => {
  const { selectedContext, workspaceMode } = useWorkflowStore();

  if (!selectedContext) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 0.5,
          bgcolor: '#050b14',
          minHeight: '36px',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          No clip selected. Use Timeline or Media items to define editing context.
        </Typography>
      </Box>
    );
  }

  const renderContextualTools = () => {
    switch (selectedContext.type) {
      case 'Video Clip':
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              ✂️ Razor Split
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              🎭 Chroma Key Mask
            </Button>
            <Button size="small" variant="outlined" sx={{ fontSize: '0.68rem', py: 0.25 }}>
              🌈 Speed Adapter
            </Button>
          </>
        );
      case 'Audio Clip':
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              ⚡ Normalization
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              🎤 Whisper Transcript
            </Button>
            <Button size="small" variant="outlined" sx={{ fontSize: '0.68rem', py: 0.25 }}>
              📉 Gain Envelopes
            </Button>
          </>
        );
      case 'Camera':
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              🎥 Camera Bookmark
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              📏 Solve Lens Distort
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.68rem', py: 0.25 }}
            >
              ⚡ Quick Render Frame
            </Button>
            <Button size="small" variant="outlined" sx={{ fontSize: '0.68rem', py: 0.25 }}>
              ☁️ Backup Meta
            </Button>
          </>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#0d1527',
        border: '1px solid #1b2f54',
        borderRadius: '6px',
        px: 2,
        py: 0.75,
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#00f0ff',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.68rem',
          }}
        >
          Context: [{selectedContext.type}]
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.72rem' }}
        >
          {selectedContext.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Divider orientation="vertical" flexItem sx={{ borderColor: '#1b2f54', my: 0.5 }} />
        {renderContextualTools()}
      </Box>
    </Box>
  );
};
