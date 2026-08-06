import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, Button, Typography, Chip, Tooltip } from '@mui/material';
import { Panel as SplitPanel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { darkTheme, Panel as CustomPanel, Inspector } from '@ai-video-editor/ui';
import Toolbar from '../components/Editor/Toolbar';
import Sidebar from '../components/Editor/Sidebar';
import Preview from '../components/Editor/Preview';
import Timeline from '../components/Editor/Timeline';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import StatusBar from '../components/Editor/StatusBar';
import { useWorkflowStore } from '../store/useWorkflowStore';
import TimelineCommentsPanel from '../features/collaboration/components/TimelineCommentsPanel';

// Recovery integration
import { useAutoSave } from '../features/recovery/hooks/useAutoSave';
import { useRecovery } from '../features/recovery/hooks/useRecovery';
import { RecoveryDialog } from '../features/recovery/components/RecoveryDialog';
import { RecoveryNotifications } from '../features/recovery/components/RecoveryNotifications';
import { useProjects } from '../hooks/useProjects';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects } = useProjects();

  const currentProject = projects?.find((p) => p.id === id);
  const projectName = currentProject?.name || 'Untitled Project';

  // Initialize and run AutoSave
  useAutoSave(id || '', projectName);

  // Initialize and run startup Recovery scanner
  const { scanForRecovery } = useRecovery(id || '');

  // Workspace presets state integration
  const [layoutPreset, setLayoutPreset] = useState(() => {
    return localStorage.getItem('rr_editor_layout_preset') || 'classic';
  });

  const { workspaceLocked } = useWorkflowStore();

  useEffect(() => {
    if (id) {
      scanForRecovery();
    }
  }, [id, scanForRecovery]);

  useEffect(() => {
    const handleStorageChange = () => {
      const activePreset = localStorage.getItem('rr_editor_layout_preset') || 'classic';
      setLayoutPreset(activePreset);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Compute pane sizes according to active layout/productivity presets
  const sidebarDefaultSize =
    layoutPreset === 'audio' ? 15 :
    layoutPreset === 'color' ? 25 :
    layoutPreset === 'focus' ? 0 :
    layoutPreset === 'editing' ? 15 :
    layoutPreset === 'review' ? 20 :
    layoutPreset === 'presentation' ? 0 :
    layoutPreset === 'ai' ? 30 :
    layoutPreset === 'minimal' ? 5 : 20;

  const previewDefaultSize =
    layoutPreset === 'audio' ? 40 :
    layoutPreset === 'color' ? 55 :
    layoutPreset === 'focus' ? 90 :
    layoutPreset === 'editing' ? 45 :
    layoutPreset === 'review' ? 70 :
    layoutPreset === 'presentation' ? 100 :
    layoutPreset === 'ai' ? 50 :
    layoutPreset === 'minimal' ? 80 : 60;

  const timelineDefaultSize =
    layoutPreset === 'audio' ? 60 :
    layoutPreset === 'color' ? 45 :
    layoutPreset === 'focus' ? 10 :
    layoutPreset === 'editing' ? 55 :
    layoutPreset === 'review' ? 30 :
    layoutPreset === 'presentation' ? 0 :
    layoutPreset === 'ai' ? 50 :
    layoutPreset === 'minimal' ? 20 : 40;

  const inspectorDefaultSize =
    layoutPreset === 'audio' ? 20 :
    layoutPreset === 'color' ? 20 :
    layoutPreset === 'focus' ? 0 :
    layoutPreset === 'editing' ? 20 :
    layoutPreset === 'review' ? 10 :
    layoutPreset === 'presentation' ? 0 :
    layoutPreset === 'ai' ? 20 :
    layoutPreset === 'minimal' ? 0 : 20;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#050b14' }}>
        <CssBaseline />
        {layoutPreset !== 'presentation' && <Toolbar projectId={id} />}

        {/* Coordinated live layout stats bar */}
        {layoutPreset !== 'presentation' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#0d1527', borderBottom: '1px solid #1b2f54' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold' }}>
                Active Mode: {layoutPreset.toUpperCase()}
              </Typography>
              <Chip label="WebGL 60FPS" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Project: {projectName}
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', p: 1, gap: 1 }}>
          <PanelGroup direction="horizontal">
            {/* Left Sidebar inside Panel wrapper */}
            {sidebarDefaultSize > 0 && (
              <SplitPanel defaultSize={sidebarDefaultSize} minSize={10}>
                <CustomPanel title="Workspace Explorer">
                  <Sidebar projectId={id || ''} />
                </CustomPanel>
              </SplitPanel>
            )}

            {sidebarDefaultSize > 0 && !workspaceLocked && (
              <PanelResizeHandle
                style={{ width: '6px', backgroundColor: 'transparent', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ width: '2px', height: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }} />
              </PanelResizeHandle>
            )}

            {/* Center Area (Preview + Timeline) */}
            <SplitPanel defaultSize={100 - sidebarDefaultSize - inspectorDefaultSize}>
              <PanelGroup direction="vertical">
                {previewDefaultSize > 0 && (
                  <SplitPanel defaultSize={previewDefaultSize}>
                    <CustomPanel title="Composition Viewport">
                      <Preview />
                    </CustomPanel>
                  </SplitPanel>
                )}

                {previewDefaultSize > 0 && timelineDefaultSize > 0 && !workspaceLocked && (
                  <PanelResizeHandle
                    style={{ height: '6px', backgroundColor: 'transparent', cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ height: '2px', width: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }} />
                  </PanelResizeHandle>
                )}

                {timelineDefaultSize > 0 && (
                  <SplitPanel defaultSize={timelineDefaultSize}>
                    <CustomPanel title="Multi-track Timeline Controls">
                      <Timeline />
                    </CustomPanel>
                  </SplitPanel>
                )}
              </PanelGroup>
            </SplitPanel>

            {inspectorDefaultSize > 0 && !workspaceLocked && (
              <PanelResizeHandle
                style={{ width: '6px', backgroundColor: 'transparent', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ width: '2px', height: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }} />
              </PanelResizeHandle>
            )}

            {/* Right Properties Panel wrapped in Inspector */}
            {inspectorDefaultSize > 0 && (
              <SplitPanel defaultSize={inspectorDefaultSize} minSize={10}>
                <Inspector title="Track Inspector & ABAC">
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
                    <PropertiesPanel />
                    {layoutPreset === 'review' && (
                      <Box sx={{ flexGrow: 1 }}>
                        <TimelineCommentsPanel />
                      </Box>
                    )}
                  </Box>
                </Inspector>
              </SplitPanel>
            )}
          </PanelGroup>
        </Box>

        {layoutPreset !== 'presentation' && <StatusBar />}

        {/* Unscheduled shutdown recovery dialog */}
        <RecoveryDialog projectId={id || ''} />

        {/* Global floating notifications */}
        <RecoveryNotifications />
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
