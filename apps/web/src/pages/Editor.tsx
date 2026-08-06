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
import { ContextualToolbar } from '../components/Editor/ContextualToolbar';
import { UnifiedStatusCenter } from '../components/Editor/UnifiedStatusCenter';
import { useWorkflowStore } from '../store/useWorkflowStore';

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

  // Workflow orchestration layout subscriptions
  const { workspaceMode, setWorkspaceMode } = useWorkflowStore();

  useEffect(() => {
    if (id) {
      scanForRecovery();
    }
  }, [id, scanForRecovery]);

  // Compute pane sizes according to active workflow presets
  const sidebarDefaultSize =
    workspaceMode === 'audio'
      ? 15
      : workspaceMode === 'color'
        ? 25
        : workspaceMode === 'import'
          ? 40
          : workspaceMode === 'focus'
            ? 0
            : workspaceMode === 'editing'
              ? 15
              : workspaceMode === 'review'
                ? 20
                : workspaceMode === 'presentation'
                  ? 0
                  : workspaceMode === 'ai'
                    ? 30
                    : workspaceMode === 'minimal'
                      ? 5
                      : 20;

  const previewDefaultSize =
    workspaceMode === 'audio'
      ? 40
      : workspaceMode === 'color'
        ? 55
        : workspaceMode === 'import'
          ? 10
          : workspaceMode === 'focus'
            ? 90
            : workspaceMode === 'editing'
              ? 45
              : workspaceMode === 'review'
                ? 70
                : workspaceMode === 'presentation'
                  ? 100
                  : workspaceMode === 'ai'
                    ? 50
                    : workspaceMode === 'minimal'
                      ? 80
                      : 60;

  const timelineDefaultSize =
    workspaceMode === 'audio'
      ? 60
      : workspaceMode === 'color'
        ? 45
        : workspaceMode === 'import'
          ? 50
          : workspaceMode === 'focus'
            ? 10
            : workspaceMode === 'editing'
              ? 55
              : workspaceMode === 'review'
                ? 30
                : workspaceMode === 'presentation'
                  ? 0
                  : workspaceMode === 'ai'
                    ? 50
                    : workspaceMode === 'minimal'
                      ? 20
                      : 40;

  const inspectorDefaultSize =
    workspaceMode === 'audio'
      ? 20
      : workspaceMode === 'color'
        ? 20
        : workspaceMode === 'import'
          ? 10
          : workspaceMode === 'focus'
            ? 0
            : workspaceMode === 'editing'
              ? 20
              : workspaceMode === 'review'
                ? 10
                : workspaceMode === 'presentation'
                  ? 0
                  : workspaceMode === 'ai'
                    ? 20
                    : workspaceMode === 'minimal'
                      ? 0
                      : 20;

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#050b14',
        }}
      >
        <CssBaseline />
        {workspaceMode !== 'presentation' && <Toolbar projectId={id} />}

        {/* Dynamic Contextual Toolbar for selected items */}
        {workspaceMode !== 'presentation' && (
          <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
            <ContextualToolbar />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', p: 1, gap: 1 }}>
          <PanelGroup direction="horizontal">
            {/* Left Sidebar inside Panel wrapper if layout preset allows */}
            {sidebarDefaultSize > 0 && (
              <SplitPanel defaultSize={sidebarDefaultSize} minSize={10}>
                <CustomPanel title={`${workspaceMode.toUpperCase()} Explorer`}>
                  <Sidebar projectId={id || ''} />
                </CustomPanel>
              </SplitPanel>
            )}

            {sidebarDefaultSize > 0 && (
              <PanelResizeHandle
                style={{
                  width: '6px',
                  backgroundColor: 'transparent',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{ width: '2px', height: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }}
                />
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

                {previewDefaultSize > 0 && timelineDefaultSize > 0 && (
                  <PanelResizeHandle
                    style={{
                      height: '6px',
                      backgroundColor: 'transparent',
                      cursor: 'row-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{ height: '2px', width: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }}
                    />
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

            {inspectorDefaultSize > 0 && (
              <PanelResizeHandle
                style={{
                  width: '6px',
                  backgroundColor: 'transparent',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{ width: '2px', height: '30px', bgcolor: '#1b2f54', borderRadius: '1px' }}
                />
              </PanelResizeHandle>
            )}

            {/* Right Properties Panel wrapped in Inspector */}
            {inspectorDefaultSize > 0 && (
              <SplitPanel defaultSize={inspectorDefaultSize} minSize={10}>
                <Inspector title="Track Inspector & ABAC">
                  <PropertiesPanel />
                </Inspector>
              </SplitPanel>
            )}
          </PanelGroup>
        </Box>

        {/* Permanently visible contextual status bar or expanded Unified Status Center */}
        {workspaceMode !== 'presentation' && <UnifiedStatusCenter />}

        {/* Unscheduled shutdown recovery dialog */}
        <RecoveryDialog projectId={id || ''} />

        {/* Global floating notifications */}
        <RecoveryNotifications />
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
