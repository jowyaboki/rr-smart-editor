import React from 'react';
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

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

            <PanelResizeHandle style={{ width: '4px', backgroundColor: '#333', cursor: 'col-resize' }} />

            {/* Center Area (Preview + Timeline) */}
            <Panel defaultSize={60}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={70}>
                  <Preview />
                </Panel>
                <PanelResizeHandle style={{ height: '4px', backgroundColor: '#333', cursor: 'row-resize' }} />
                <Panel defaultSize={30}>
                  <Timeline />
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle style={{ width: '4px', backgroundColor: '#333', cursor: 'col-resize' }} />

            {/* Right Properties Panel */}
            <Panel defaultSize={20} minSize={15}>
              <PropertiesPanel />
            </Panel>
          </PanelGroup>
        </Box>

        <StatusBar />
      </Box>
    </ThemeProvider>
  );
};

export default Editor;
