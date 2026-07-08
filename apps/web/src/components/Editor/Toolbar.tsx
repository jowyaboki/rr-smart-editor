import React from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, Button, IconButton, Box } from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTimelineStore } from '../../store/useTimelineStore';

const Toolbar: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const navigate = useNavigate();
  const { undo, redo } = useTimelineStore.temporal.getState();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #333' }}>
      <MuiToolbar variant="dense">
        <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Editor - {projectId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => undo()}><UndoIcon /></IconButton>
          <IconButton size="small" onClick={() => redo()}><RedoIcon /></IconButton>
          <Button startIcon={<PlayIcon />} size="small">Preview</Button>
          <Button startIcon={<SaveIcon />} variant="contained" size="small">Save</Button>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
