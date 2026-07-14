import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { theme } from '@ai-video-editor/ui';
import { useEditorStore } from '../store/editorStore';
import { Toolbar as EditorToolbar } from './EditorToolbar';
import { Sidebar as EditorSidebar } from './EditorSidebar';
import { InspectorPanel } from './InspectorPanel';
import { StatusBar } from './StatusBar';
import Preview from '@/components/Editor/Preview';
import Timeline from '@/components/Editor/Timeline';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const EditorWorkspace: React.FC = () => {
  const { layout, updateLayout } = useEditorStore();
  useKeyboardShortcuts();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <CssBaseline />
        <EditorToolbar />

        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <PanelGroup direction="horizontal" onLayout={(sizes) => {
               updateLayout({ sidebarWidth: sizes[0], inspectorWidth: sizes[2] });
            }}>
              <Panel defaultSize={layout.sidebarWidth} minSize={10}>
                <EditorSidebar />
              </Panel>

              <PanelResizeHandle style={{ width: 4, backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'col-resize' }} />

              <Panel defaultSize={100 - layout.sidebarWidth - layout.inspectorWidth}>
                <PanelGroup direction="vertical" onLayout={(sizes) => {
                   updateLayout({ timelineHeight: sizes[1] });
                }}>
                  <Panel defaultSize={100 - layout.timelineHeight}>
                     <Preview />
                  </Panel>
                  <PanelResizeHandle style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'row-resize' }} />
                  <Panel defaultSize={layout.timelineHeight} minSize={10}>
                     <Timeline />
                  </Panel>
                </PanelGroup>
              </Panel>

              <PanelResizeHandle style={{ width: 4, backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'col-resize' }} />

              <Panel defaultSize={layout.inspectorWidth} minSize={10}>
                <InspectorPanel />
              </Panel>
            </PanelGroup>
          </Box>
          <StatusBar />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
