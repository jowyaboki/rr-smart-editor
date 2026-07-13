import React, { useState } from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  Button,
  IconButton,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Home as HomeIcon,
  Movie as RenderIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useTriggerRender, useRenderStatus } from '@/hooks/useRender';

const Toolbar: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const navigate = useNavigate();
  const { undo, redo } = useTimelineStore.temporal.getState();
  const triggerRender = useTriggerRender(projectId || '');
  const [activeRenderId, setActiveRenderId] = useState<string | null>(null);
  const { data: renderStatus } = useRenderStatus(activeRenderId || undefined);

  const handleRender = async () => {
    const render = await triggerRender.mutateAsync();
    setActiveRenderId(render.id);
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #333' }}>
      <MuiToolbar variant="dense">
        <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Editor - {projectId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {renderStatus?.status === 'rendering' && (
            <Box sx={{ width: 100, mr: 2 }}>
              <Typography variant="caption">
                Rendering: {Math.round(renderStatus.progress)}%
              </Typography>
              <LinearProgress variant="determinate" value={renderStatus.progress} />
            </Box>
          )}
          <IconButton size="small" onClick={() => undo()}>
            <UndoIcon />
          </IconButton>
          <IconButton size="small" onClick={() => redo()}>
            <RedoIcon />
          </IconButton>
          <Button startIcon={<PlayIcon />} size="small">
            Preview
          </Button>
          <Button
            startIcon={<RenderIcon />}
            onClick={handleRender}
            disabled={renderStatus?.status === 'rendering'}
            size="small"
          >
            Render
          </Button>
          <Button startIcon={<SaveIcon />} variant="contained" size="small">
            Save
          </Button>
        </Box>
      </MuiToolbar>

      <Dialog
        open={!!renderStatus && renderStatus.status === 'completed'}
        onClose={() => setActiveRenderId(null)}
      >
        <DialogTitle>Render Complete</DialogTitle>
        <DialogContent>
          <Typography>Your video is ready!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActiveRenderId(null)}>Close</Button>
          <Button
            component="a"
            href={
              renderStatus?.outputUrl
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${renderStatus.outputUrl}`
                : '#'
            }
            target="_blank"
            variant="contained"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Toolbar;
