import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { Movie as MediaIcon, Title as TextIcon, Audiotrack as AudioIcon, AutoAwesome as EffectsIcon } from '@mui/icons-material';
import MediaManager from './MediaManager';

interface SidebarProps {
  projectId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ projectId }) => {
  const [value, setValue] = React.useState(0);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Tabs value={value} onChange={(e, v) => setValue(v)} variant="fullWidth">
        <Tab icon={<MediaIcon />} />
        <Tab icon={<TextIcon />} />
        <Tab icon={<AudioIcon />} />
        <Tab icon={<EffectsIcon />} />
      </Tabs>
      <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>
        {value === 0 && <MediaManager projectId={projectId} />}
        {value === 1 && <Typography variant="body2" sx={{ p: 2 }}>Text Overlays</Typography>}
        {value === 2 && <Typography variant="body2" sx={{ p: 2 }}>Audio Tracks</Typography>}
        {value === 3 && <Typography variant="body2" sx={{ p: 2 }}>Effects</Typography>}
      </Box>
    </Box>
  );
};

export default Sidebar;
