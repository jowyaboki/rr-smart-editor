import React from 'react';
import { Box, Typography } from '@mui/material';

const StatusBar: React.FC = () => {
  return (
    <Box sx={{ p: 0.5, px: 2, display: 'flex', justifyContent: 'space-between', bgcolor: 'primary.dark', color: 'white' }}>
      <Typography variant="caption">Ready</Typography>
      <Typography variant="caption">1920x1080 | 30fps</Typography>
    </Box>
  );
};

export default StatusBar;
