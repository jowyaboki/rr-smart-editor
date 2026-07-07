import React from 'react';
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Movie as MediaIcon, Title as TextIcon, Audiotrack as AudioIcon, AutoAwesome as EffectsIcon } from '@mui/icons-material';

const Sidebar: React.FC = () => {
  const [value, setValue] = React.useState(0);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Tabs value={value} onChange={(e, v) => setValue(v)} variant="fullWidth">
        <Tab icon={<MediaIcon />} />
        <Tab icon={<TextIcon />} />
        <Tab icon={<AudioIcon />} />
        <Tab icon={<EffectsIcon />} />
      </Tabs>
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>Assets</Typography>
        <Typography variant="body2" color="text.secondary">No assets imported.</Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
