import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import {
  Movie as MediaIcon,
  Title as TextIcon,
  Audiotrack as AudioIcon,
  AutoAwesome as EffectsIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import MediaManager from './MediaManager';
import AIAssistant from './AIAssistant';

interface SidebarProps {
  projectId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ projectId }) => {
  const [value, setValue] = React.useState(0);
  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Tabs value={value} onChange={(e, v) => setValue(v)} variant="fullWidth">
        <Tab icon={<MediaIcon />} />
        <Tab icon={<AIIcon />} />
        <Tab icon={<TextIcon />} />
        <Tab icon={<AudioIcon />} />
      </Tabs>
      <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>
        {value === 0 && <MediaManager projectId={projectId} />}
        {value === 1 && <AIAssistant />}
        {value === 2 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Text Overlays
          </Typography>
        )}
        {value === 3 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Audio Tracks
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
