import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  ThemeProvider,
  IconButton,
  Button,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary as ProjectsIcon,
  PermMedia as MediaIcon,
  Timeline as TimelineIcon,
  AutoAwesome as EffectsIcon,
  Audiotrack as AudioIcon,
  ColorLens as ColorIcon,
  Psychology as AIIcon,
  OfflineBolt as AutomationIcon,
  HomeWork as StudioIcon,
  CloudUpload as CloudIcon,
  Storefront as MarketplaceIcon,
  Assessment as AnalyticsIcon,
  AdminPanelSettings as AdministrationIcon,
  Code as DeveloperIcon,
  Settings as SettingsIcon,
  Memory as RenderIcon,
  Keyboard as KeyboardIcon,
  Layers as WorkspaceIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon
} from '@mui/icons-material';
import { darkTheme, DESIGN_TOKENS } from '../theme';
import { CommandPalette } from './Shared';
import { WorkflowNavigator } from './WorkflowNavigator';

const drawerWidth = 220;

const menuItems = [
  { label: 'Workspace', icon: <WorkspaceIcon />, path: '/' },
  { label: 'Projects', icon: <ProjectsIcon />, path: '/' },
  { label: 'Media', icon: <MediaIcon />, path: '/preview' },
  { label: 'Timeline', icon: <TimelineIcon />, path: '/' },
  { label: 'Effects', icon: <EffectsIcon />, path: '/' },
  { label: 'Audio', icon: <AudioIcon />, path: '/preview' },
  { label: 'Color', icon: <ColorIcon />, path: '/preview' },
  { label: 'AI', icon: <AIIcon />, path: '/workflows' },
  { label: 'Automation', icon: <AutomationIcon />, path: '/workflows' },
  { label: 'Studio', icon: <StudioIcon />, path: '/workflows' },
  { label: 'Render', icon: <RenderIcon />, path: '/renders' },
  { label: 'Cloud', icon: <CloudIcon />, path: '/renders' },
  { label: 'Marketplace', icon: <MarketplaceIcon />, path: '/templates' },
  { label: 'Analytics', icon: <AnalyticsIcon />, path: '/' },
  { label: 'Administration', icon: <AdministrationIcon />, path: '/' },
  { label: 'Developer', icon: <DeveloperIcon />, path: '/workflows' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/' },
];

interface LayoutProps {
  children: React.ReactNode;
  workspaceLocked?: boolean;
  onToggleWorkspaceLock?: () => void;
  workspaceMode?: string;
  onSetWorkspaceMode?: (mode: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  workspaceLocked = false,
  onToggleWorkspaceLock,
  workspaceMode = 'editing',
  onSetWorkspaceMode
}) => {
  const [openPalette, setOpenPalette] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('rr_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [activeWorkflow, setActiveWorkflow] = useState(() => {
    return localStorage.getItem('rr_active_workflow') || 'Workspace';
  });

  useEffect(() => {
    localStorage.setItem('rr_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('rr_active_workflow', activeWorkflow);
  }, [activeWorkflow]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpenPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = menuItems.map((item) => ({
    label: `Go to ${item.label}`,
    category: 'Navigation',
    action: () => {
      setActiveWorkflow(item.label);
      window.location.href = item.path;
    },
  }));

  const layoutCommands = [
    {
      label: 'Toggle Navigation Sidebar',
      category: 'Workspace Layout',
      action: () => setSidebarCollapsed((c: boolean) => !c),
    },
    {
      label: 'Focus Productivity Mode (Full screen center viewport)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'focus');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Editing Productivity Mode (Timeline dominant)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'editing');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Review Productivity Mode (Feedback tools active)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'review');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Presentation Productivity Mode (Frameless composition view)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'presentation');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Audio Productivity Mode (Mixer faders & waveforms prioritized)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'audio');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Color Productivity Mode (LUT Calibration/Scopes)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'color');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'AI Copilot Productivity Mode (Intelligent suggestions)',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'ai');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Minimalist Productivity Mode',
      category: 'Productivity Mode',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'minimal');
        window.dispatchEvent(new Event('storage'));
      },
    },
    {
      label: 'Classic Layout Preset',
      category: 'Workspace Preset',
      action: () => {
        localStorage.setItem('rr_editor_layout_preset', 'classic');
        window.dispatchEvent(new Event('storage'));
      },
    }
  ];

  // Fuzzy Universal Search extensions indexing projects, tasks, comments, and tutorials (Phase 6)
  const searchEverythingCommands = [
    { label: 'Filter: Active Comments: "Mute vocal rumble on audio track 2"', category: 'Active Comments', action: () => alert('Showing review comment location...') },
    { label: 'Filter: Active Tasks: "SLA Shard #2 Render completed"', category: 'Active Tasks', action: () => alert('Viewing SLA Task progress...') },
    { label: 'Search Guide: "How to map colorist primary wheels"', category: 'Documentation', action: () => alert('Loading Knowledge Hub Article...') },
    { label: 'Search Guide: "Smoothing tracks with Bezier Curves"', category: 'Documentation', action: () => alert('Loading Knowledge Hub Article...') },
    { label: 'Search Guide: "Resolving multi-user edit collisions"', category: 'Documentation', action: () => alert('Loading Knowledge Hub Article...') },
    { label: 'Search Guide: "Custom biquad cutoffs parameters"', category: 'Documentation', action: () => alert('Loading Knowledge Hub Article...') },
    { label: 'Deploy AI Timeline Splitter Agent', category: 'AI Tools', action: () => alert('AI edit suggestion agent ready.') }
  ];

  const allCommands = [...commands, ...layoutCommands, ...searchEverythingCommands];

  const width = sidebarCollapsed ? 64 : drawerWidth;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: DESIGN_TOKENS.colors.dark.bgMain }}>
        <CssBaseline />

        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
            borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            boxShadow: 'none',
          }}
        >
          <Toolbar variant="dense" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                edge="start"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                sx={{ color: DESIGN_TOKENS.colors.dark.accentPrimary }}
              >
                🚀
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: DESIGN_TOKENS.typography.weight.bold, letterSpacing: '0.5px', mr: 3 }}>
                RR Smart Editor
              </Typography>

              {/* Integrated Persistent Workflow Navigator stage bar with prop mapping */}
              <WorkflowNavigator workspaceMode={workspaceMode} onSetWorkspaceMode={onSetWorkspaceMode} />
            </Box>

            {/* Global Search trigger for command palette & Workspace lock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {onToggleWorkspaceLock && (
                <Tooltip title={workspaceLocked ? 'Unlock Workspace Columns' : 'Lock Workspace Layout'}>
                  <IconButton onClick={onToggleWorkspaceLock} sx={{ color: workspaceLocked ? '#ec4899' : '#94a3b8' }}>
                    {workspaceLocked ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}

              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenPalette(true)}
                startIcon={<KeyboardIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: DESIGN_TOKENS.colors.dark.border,
                  color: DESIGN_TOKENS.colors.dark.textSecondary,
                  bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
                  px: 2,
                  '&:hover': {
                    borderColor: DESIGN_TOKENS.colors.dark.accentPrimary,
                    bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
                  },
                }}
              >
                Press Ctrl+K
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: width,
            flexShrink: 0,
            transition: 'width 0.2s ease-in-out',
            [`& .MuiDrawer-paper`]: {
              width: width,
              boxSizing: 'border-box',
              bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
              borderRight: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar variant="dense" />
          <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, py: 1 }}>
            <List sx={{ p: 0 }}>
              {menuItems.map((item, idx) => {
                const isActive = activeWorkflow === item.label;
                return (
                  <ListItem key={idx} disablePadding sx={{ display: 'block' }}>
                    <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
                      <ListItemButton
                        onClick={() => {
                          setActiveWorkflow(item.label);
                          window.location.href = item.path;
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: sidebarCollapsed ? 'center' : 'initial',
                          px: 2.5,
                          bgcolor: isActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                          borderLeft: isActive ? `3px solid ${DESIGN_TOKENS.colors.dark.accentPrimary}` : '3px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: sidebarCollapsed ? 'auto' : 2,
                            justifyContent: 'center',
                            color: isActive ? DESIGN_TOKENS.colors.dark.accentPrimary : DESIGN_TOKENS.colors.dark.textSecondary,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!sidebarCollapsed && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '0.8rem',
                              fontWeight: isActive ? DESIGN_TOKENS.typography.weight.bold : 'normal',
                              color: isActive ? DESIGN_TOKENS.colors.dark.accentPrimary : DESIGN_TOKENS.colors.dark.textPrimary,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${width}px)`,
            mt: '48px',
            transition: 'width 0.2s ease-in-out',
          }}
        >
          {children}
        </Box>

        <CommandPalette
          open={openPalette}
          onClose={() => setOpenPalette(false)}
          commands={allCommands}
        />
      </Box>
    </ThemeProvider>
  );
};
