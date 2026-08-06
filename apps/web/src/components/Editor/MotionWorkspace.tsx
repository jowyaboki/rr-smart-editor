import React from 'react';
import { Box, Typography, Button, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import {
  Layers as LayersIcon,
  Timeline as MotionIcon,
  Tune as ControlIcon,
  PlayArrow as PresetIcon
} from '@mui/icons-material';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const MotionWorkspace: React.FC = () => {
  const { activeEasing, setActiveEasing } = useWorkflowStore();

  const layers = [
    { name: 'Subtitle Overlay 1', type: 'text', opacity: 100 },
    { name: 'Brand Watermark logo', type: 'image', opacity: 80 },
    { name: 'Main Interview Shot', type: 'video', opacity: 100 },
    { name: 'Secondary B-Roll clip', type: 'video', opacity: 100 },
  ];

  const easingPresets = [
    { id: 'linear', label: 'Linear', desc: 'Constant rate progression' },
    { id: 'ease-in', label: 'Ease In', desc: 'Starts slow, accelerates' },
    { id: 'ease-out', label: 'Ease Out', desc: 'Starts fast, decelerates' },
    { id: 'bezier', label: 'Bezier', desc: 'Symmetric S-Curve path' },
  ] as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* 1. Composition Hierarchy Layer list */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <LayersIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Composition Layers
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {layers.map((layer, idx) => (
            <ListItem
              key={idx}
              dense
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                mb: 1,
                borderRadius: '4px',
                border: '1px solid #1b2f54',
                '&:hover': { borderColor: '#ec4899', bgcolor: 'rgba(236,72,153,0.03)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 24, color: '#ec4899' }}>
                <MotionIcon style={{ fontSize: '14px' }} />
              </ListItemIcon>
              <ListItemText
                primary={layer.name}
                secondary={`Type: ${layer.type.toUpperCase()} • Opacity: ${layer.opacity}%`}
                primaryTypographyProps={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#ffffff' }}
                secondaryTypographyProps={{ fontSize: '0.6rem', color: '#94a3b8' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 2. Keyframe Animation Easing Library Card */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ControlIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Easing Preset Library
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {easingPresets.map((preset) => {
            const isSel = activeEasing === preset.id;
            return (
              <Button
                key={preset.id}
                size="small"
                variant={isSel ? 'contained' : 'outlined'}
                color={isSel ? 'secondary' : 'inherit'}
                onClick={() => setActiveEasing(preset.id)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.68rem',
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  alignItems: 'center',
                  borderColor: isSel ? '#ec4899' : '#1b2f54',
                  bgcolor: isSel ? 'rgba(236,72,153,0.15)' : 'transparent',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {preset.label}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', opacity: 0.7, textAlign: 'center' }}>
                  {preset.desc}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* 3. Reusable Preset / Transformation alignments */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1, display: 'block' }}>
          Alignment & Snapping Tools
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" sx={{ flexGrow: 1, fontSize: '0.65rem' }}>Align Left</Button>
          <Button size="small" variant="outlined" sx={{ flexGrow: 1, fontSize: '0.65rem' }}>Align Center</Button>
          <Button size="small" variant="outlined" sx={{ flexGrow: 1, fontSize: '0.65rem' }}>Align Right</Button>
        </Box>
      </Box>
    </Box>
  );
};
