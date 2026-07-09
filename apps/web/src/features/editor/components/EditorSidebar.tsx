import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import {
  FolderSpecial as MediaIcon,
  AutoAwesome as AIIcon,
  VideoLibrary as ProjectsIcon,
  TextFields as TextIcon,
  AutoFixHigh as TransitionsIcon,
  History as HistoryIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useEditorStore } from '../store/editorStore';
import MediaPage from '@/features/media/pages/MediaPage';
import AIAssistant from '@/components/Editor/AIAssistant';
import { RenderQueuePanel } from '@/features/rendering/components/RenderQueuePanel';
import { AIChatPanel } from '@/features/ai/chat/AIChatPanel';

export const Sidebar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab } = useEditorStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: any) => {
    setActiveSidebarTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#102031' }}>
      <Tabs
        value={activeSidebarTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ minHeight: 48, borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <Tab icon={<ProjectsIcon fontSize="small" />} value="projects" />
        <Tab icon={<MediaIcon fontSize="small" />} value="media" />
        <Tab icon={<ChatIcon fontSize="small" />} value="ai" />
        <Tab icon={<HistoryIcon fontSize="small" />} value="rendering" />
      </Tabs>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {activeSidebarTab === 'media' && <MediaPage />}
        {activeSidebarTab === 'ai' && <AIChatPanel />}
        {activeSidebarTab === 'rendering' && <RenderQueuePanel />}
        {activeSidebarTab === 'projects' && <Typography sx={{ p: 2, color: 'text.secondary' }}>Projects Library</Typography>}
      </Box>
    </Box>
  );
};
