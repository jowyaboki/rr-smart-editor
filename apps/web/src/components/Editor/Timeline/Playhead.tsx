import React from 'react';
import { Box } from '@mui/material';

interface PlayheadProps {
  playhead: number;
  zoom: number;
}

const Playhead: React.FC<PlayheadProps> = ({ playhead, zoom }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: playhead * zoom,
        width: '2px',
        bgcolor: 'error.main',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: -5,
          width: 12,
          height: 12,
          bgcolor: 'error.main',
          clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
        },
      }}
    />
  );
};

export default Playhead;
