import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary as VideoIcon,
  Settings as SettingsIcon,
  PlayArrow as PreviewIcon,
  AutoAwesome as WorkflowsIcon,
} from '@mui/icons-material';
import { darkTheme } from '../theme';

const drawerWidth = 240;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              AI Video Editor
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem component="a" href="/">
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem component="a" href="/preview">
                <ListItemIcon>
                  <PreviewIcon />
                </ListItemIcon>
                <ListItemText primary="Preview" />
              </ListItem>
              <ListItem component="a" href="/workflows">
                <ListItemIcon>
                  <WorkflowsIcon />
                </ListItemIcon>
                <ListItemText primary="Workflows" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <VideoIcon />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
