import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Timeline: React.FC = () => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid #333' }}>
        <Typography variant="caption">Timeline</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1, gap: 1 }}>
        <Box sx={{ h: 40, bgcolor: 'grey.900', borderRadius: 1 }} />
        <Box sx={{ h: 40, bgcolor: 'grey.900', borderRadius: 1 }} />
      </Box>
    </Box>
  );
};

export default Timeline;
