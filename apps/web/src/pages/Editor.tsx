import React from 'react';
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { darkTheme } from '@ai-video-editor/ui';
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
  return <EditorWorkspace />;
  const { id } = useParams<{ id: string }>();
  const { data: projects } = useProjects();

  const currentProject = projects?.find((p) => p.id === id);
  const projectName = currentProject?.name || 'Untitled Project';

  // Initialize and run AutoSave
  useAutoSave(id || '', projectName);

  // Initialize and run startup Recovery scanner
  const { scanForRecovery } = useRecovery(id || '');

  useEffect(() => {
    if (id) {
      // Trigger scan on mount
      scanForRecovery();
    }
  }, [id, scanForRecovery]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CssBaseline />
        <Toolbar projectId={id} />

        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          <PanelGroup direction="horizontal">
            {/* Left Sidebar */}
            <Panel defaultSize={20} minSize={15}>
              <Sidebar projectId={id || ''} />
            </Panel>

            <PanelResizeHandle
              style={{ width: '4px', backgroundColor: '#333', cursor: 'col-resize' }}
            />

            {/* Center Area (Preview + Timeline) */}
            <Panel defaultSize={60}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={70}>
                  <Preview />
                </Panel>
                <PanelResizeHandle
                  style={{ height: '4px', backgroundColor: '#333', cursor: 'row-resize' }}
                />
                <Panel defaultSize={30}>
                  <Timeline />
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle
              style={{ width: '4px', backgroundColor: '#333', cursor: 'col-resize' }}
            />

            {/* Right Properties Panel */}
            <Panel defaultSize={20} minSize={15}>
              <PropertiesPanel />
            </Panel>
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
