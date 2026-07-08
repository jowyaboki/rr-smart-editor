import React from 'react';
import { Box, IconButton, Slider, Stack, ToggleButton } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Link as SnapIcon,
  Undo as UndoIcon,
  Redo as RedoIcon
} from '@mui/icons-material';
import { useTimelineStore } from '../store/timelineStore';

export const TimelineHeader: React.FC = () => {
  const { zoom, setZoom, snapEnabled, toggleSnap } = useTimelineStore();
  const { undo, redo } = useTimelineStore.temporal.getState();

  return (
    <Box sx={{ p: 1, borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={() => undo()}><UndoIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={() => redo()}><RedoIcon fontSize="small" /></IconButton>
        <ToggleButton
          value="snap"
          selected={snapEnabled}
          onChange={toggleSnap}
          size="small"
          sx={{ height: 30 }}
        >
          <SnapIcon fontSize="small" />
        </ToggleButton>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <ZoomOutIcon fontSize="small" />
        <Slider
          value={zoom}
          min={0.1}
          max={5}
          step={0.1}
          onChange={(e, v) => setZoom(v as number)}
          sx={{ width: 150 }}
        />
        <ZoomInIcon fontSize="small" />
      </Stack>
    </Box>
  );
};
