import React from 'react';
import { Player } from '@remotion/player';
import { HelloWorld } from '../remotion/HelloWorld';
import { Box, Typography, Paper } from '@mui/material';

const Preview: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Video Preview
      </Typography>
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
        <Player
          component={HelloWorld}
          durationInFrames={300}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          style={{
            width: '100%',
            aspectRatio: '16/9',
          }}
          controls
        />
      </Paper>
    </Box>
  );
};

export default Preview;
