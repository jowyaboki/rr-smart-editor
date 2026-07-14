import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, ThemeProvider, ListItemButton } from '@mui/material';
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
  AutoAwesome as TemplateIcon,
  FolderSpecial as MediaIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
} from '@mui/icons-material';
import { darkTheme } from '../theme';

const drawerWidth = 240;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Projects', icon: <VideoIcon />, path: '/projects' },
    { text: 'Templates', icon: <TemplateIcon />, path: '/templates' },
    { text: 'Media', icon: <MediaIcon />, path: '/media' },
    { text: 'Settings', icon: <SettingsIcon />, path: '#' },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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
              {menuItems.map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                >
                  <ListItemButton onClick={() => item.path !== '#' && navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
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
