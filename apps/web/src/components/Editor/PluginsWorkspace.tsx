import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Box, Typography, Divider, Button, List, ListItem, ListItemText, Chip, Tooltip, IconButton, TextField } from '@mui/material';
import { Extension as PluginIcon, Add as AddIcon, FolderZip as ZipIcon } from '@mui/icons-material';

export const PluginsWorkspace: React.FC = () => {
  const { registeredStudioModules, registerStudioModule } = useWorkflowStore();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Core');

  const handleInstall = () => {
    if (newTitle.trim()) {
      const id = 'mod-' + Math.random().toString(36).substr(2, 5);
      registerStudioModule({
        id,
        title: newTitle,
        icon: 'Extension',
        category: newCategory
      });
      setNewTitle('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
      {/* 1. Dynamic Extension Installer / Registration form (v17 Sprint) */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PluginIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              Extensible Plugin Installer
            </Typography>
          </Box>
          <Chip label="v1.0 Ready" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', fontWeight: 'bold' }} />
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2, lineHeight: 1.3 }}>
          Install or register custom user-facing React panels and toolbar widgets dynamically:
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Cinema Blackmagic LUT"
            size="small"
            fullWidth
            InputProps={{
              sx: { fontSize: '0.72rem', color: '#ffffff', bgcolor: '#050b14' }
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleInstall}
            startIcon={<AddIcon />}
            sx={{ fontSize: '0.65rem', bgcolor: '#00f0ff', color: '#050b14', fontWeight: 'bold', '&:hover': { bgcolor: '#00d0f0' } }}
          >
            Install
          </Button>
        </Box>
      </Box>

      {/* 2. Central Registered Studio Modules list */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527', overflowY: 'auto', flexGrow: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
          Registered Studio Modules
        </Typography>
        <List sx={{ p: 0 }}>
          {registeredStudioModules.map((mod) => (
            <ListItem
              key={mod.id}
              dense
              sx={{
                bgcolor: 'rgba(255,255,255,0.01)',
                mb: 1,
                borderRadius: '4px',
                border: '1px solid #1b2f54',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <ListItemText
                primary={mod.title}
                secondary={`ID: ${mod.id} • Category: ${mod.category}`}
                primaryTypographyProps={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#ffffff' }}
                secondaryTypographyProps={{ fontSize: '0.62rem', color: '#94a3b8' }}
              />
              <Chip label="Loaded" size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};
export default PluginsWorkspace;
