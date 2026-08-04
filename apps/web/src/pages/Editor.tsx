import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, Button, Typography } from '@mui/material';
import { Panel as SplitPanel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { darkTheme, Panel as CustomPanel, Inspector } from '@ai-video-editor/ui';
import Toolbar from '../components/Editor/Toolbar';
import Sidebar from '../components/Editor/Sidebar';
import Preview from '../components/Editor/Preview';
import Timeline from '../components/Editor/Timeline';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import StatusBar from '../components/Editor/StatusBar';

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

  // Compute pane sizes according to active layout presets
  const sidebarDefaultSize = layoutPreset === 'audio' ? 15 : layoutPreset === 'color' ? 25 : 20;
  const previewDefaultSize = layoutPreset === 'audio' ? 40 : layoutPreset === 'color' ? 50 : 60;
  const timelineDefaultSize = layoutPreset === 'audio' ? 60 : layoutPreset === 'color' ? 50 : 40;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#0a1929' }}>
        <CssBaseline />
        <Toolbar projectId={id} />

        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', p: 1, gap: 1 }}>
          <PanelGroup direction="horizontal">
            {/* Left Sidebar inside Panel wrapper */}
            <SplitPanel defaultSize={sidebarDefaultSize} minSize={15}>
              <CustomPanel title="Workspace Explorer">
                <Sidebar projectId={id || ''} />
              </CustomPanel>
            </SplitPanel>

            <PanelResizeHandle
              style={{ width: '6px', backgroundColor: 'transparent', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box sx={{ width: '2px', height: '30px', bgcolor: '#1e293b', borderRadius: '1px' }} />
            </PanelResizeHandle>

            {/* Center Area (Preview + Timeline) */}
            <SplitPanel defaultSize={60}>
              <PanelGroup direction="vertical">
                <SplitPanel defaultSize={previewDefaultSize}>
                  <CustomPanel title="Composition Viewport">
                    <Preview />
                  </CustomPanel>
                </SplitPanel>

                <PanelResizeHandle
                  style={{ height: '6px', backgroundColor: 'transparent', cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Box sx={{ height: '2px', width: '30px', bgcolor: '#1e293b', borderRadius: '1px' }} />
                </PanelResizeHandle>

                <SplitPanel defaultSize={timelineDefaultSize}>
                  <CustomPanel title="Multi-track Timeline Controls">
                    <Timeline />
                  </CustomPanel>
                </SplitPanel>
              </PanelGroup>
            </SplitPanel>

            <PanelResizeHandle
              style={{ width: '6px', backgroundColor: 'transparent', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box sx={{ width: '2px', height: '30px', bgcolor: '#1e293b', borderRadius: '1px' }} />
            </PanelResizeHandle>

            {/* Right Properties Panel wrapped in Inspector */}
            <SplitPanel defaultSize={20} minSize={15}>
              <Inspector title="Track Inspector & ABAC">
                <PropertiesPanel />
              </Inspector>
            </SplitPanel>
          </PanelGroup>
        </Box>

        <StatusBar />

        {/* Unscheduled shutdown recovery dialog */}
        <RecoveryDialog projectId={id || ''} />

        {/* Global floating notifications */}
        <RecoveryNotifications />
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
