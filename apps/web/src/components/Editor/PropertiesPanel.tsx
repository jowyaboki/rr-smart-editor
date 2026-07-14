import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const PropertiesPanel: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderLeft: '1px solid #333',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Properties
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Select an element to view its properties.
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;
