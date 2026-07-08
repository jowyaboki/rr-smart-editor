import React, { useState } from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, IconButton, Box, Stack, Divider } from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Home as HomeIcon,
  Movie as RenderIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { Button } from '@ai-video-editor/ui';
import { ExportDialog } from '@/features/rendering/components/ExportDialog';
import { useRendering } from '@/features/rendering/hooks/useRendering';

export const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { undo, redo } = useTimelineStore.temporal.getState();
  const { createJob } = useRendering();

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = (settings: any) => {
    createJob(id || 'default', 'Project', settings);
    setExportOpen(false);
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.12)', bgcolor: '#102031' }}>
      <MuiToolbar variant="dense">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
          <IconButton edge="start" onClick={() => navigate('/')} size="small">
            <HomeIcon fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
            Editor - {id}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" onClick={() => undo()} title="Undo (Ctrl+Z)"><UndoIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => redo()} title="Redo (Ctrl+Y)"><RedoIcon fontSize="small" /></IconButton>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button
            startIcon={<RenderIcon />}
            size="small"
            variant="outlined"
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          <Button startIcon={<SaveIcon />} variant="contained" size="small" color="primary">Save</Button>
          <IconButton size="small"><SettingsIcon fontSize="small" /></IconButton>
        </Box>
      </MuiToolbar>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        projectName={id || 'Project'}
        onExport={handleExport}
      />
    </AppBar>
  );
};
