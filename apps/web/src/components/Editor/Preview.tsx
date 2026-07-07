import React from 'react';
import { Box, Typography } from '@mui/material';

const Preview: React.FC = () => {
  return (
    <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#000' }}>
      <Typography color="grey.700">Preview Area</Typography>
    </Box>
  );
};

export default Preview;
