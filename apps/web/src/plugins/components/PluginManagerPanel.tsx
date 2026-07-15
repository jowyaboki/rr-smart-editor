import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { Extension, CloudDownload, RemoveCircle, Info, CheckCircle } from '@mui/icons-material';
import { usePlugins } from '../hooks/usePlugins';
import { ExtensionPlugin, PluginContext } from '../../../../../packages/plugin-sdk/src/index';

export const PluginManagerPanel: React.FC = () => {
  const { loadedPlugins, loadPlugin, unloadPlugin } = usePlugins();

  const handleInstallMockPlugin = () => {
    const mockManifest = {
      id: 'plugin_export_pro',
      name: 'Pro GIF Exporter',
      version: '1.0.0',
      author: 'Excalibur Devs',
      description:
        'Extends timeline compilation by supporting optimized, high-fidelity GIF transcodes.',
      homepage: 'https://excalibur-plugins.com',
      engineVersion: '>=1.0.0',
      permissions: ['rendering', 'clipboard'],
      entry: 'index.js',
    };

    const mockInstance: ExtensionPlugin = {
      install: (context: PluginContext) => {
        // Register custom command
        context.commands.register({
          id: 'cmd_gif_export',
          title: 'Export active workspace range to GIF',
          execute: () => {
            context.eventBus.emit('gif_export_triggered', { frame: 0 });
            alert('Pro GIF Exporter triggered command execution!');
          },
        });

        // Register custom sidebar panel
        context.ui.registerSidebarPanel('panel_gif_settings', {
          label: 'GIF Exporter Settings',
          icon: 'Extension',
          component: () => React.createElement('div', null, 'GIF Transcode Parameters Panel'),
        });

        context.eventBus.emit('plugin_installed', { id: mockManifest.id });
      },
      uninstall: (context: PluginContext) => {
        console.log(`Uninstalling ${mockManifest.id} and cleaning extensions.`);
      },
    };

    try {
      loadPlugin(mockManifest, mockInstance);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 2,
        p: 1,
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Extension color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Extension & Plugin Manager
        </Typography>
      </Box>

      {/* Load Mock Plugin Trigger */}
      <Paper
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Explore Plugin Marketplace
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Instantly load sandboxed mock plugin structures to verify typed SDK integration.
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<CloudDownload />}
          onClick={handleInstallMockPlugin}
          sx={{ textTransform: 'none' }}
        >
          Load Pro GIF Exporter Plugin
        </Button>
      </Paper>

      {/* Loaded Plugins List */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
        Loaded Sandboxed Extensions ({loadedPlugins.length})
      </Typography>

      <Box
        sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        {loadedPlugins.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Extension sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
            <Typography variant="caption" sx={{ display: 'block' }}>
              No custom plugins installed.
            </Typography>
          </Box>
        ) : (
          loadedPlugins.map((plug) => (
            <Card
              key={plug.id}
              sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {plug.name} (v{plug.version})
                  </Typography>
                  <Tooltip title="Unload Extension">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => unloadPlugin(plug.id)}
                      startIcon={<RemoveCircle style={{ fontSize: 14 }} />}
                      sx={{ textTransform: 'none', fontSize: '0.65rem', height: 18 }}
                    >
                      Unload
                    </Button>
                  </Tooltip>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  {plug.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}
                >
                  Granted Permissions:
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {plug.permissions.map((perm) => (
                    <Chip
                      key={perm}
                      label={perm.toUpperCase()}
                      size="small"
                      sx={{ fontSize: '0.55rem', height: 16 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};
