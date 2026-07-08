import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Box } from '@mui/material';
import { CompositionBuilder } from '@/remotion/CompositionBuilder';
import { useTimelineStore } from '@/store/useTimelineStore';

const Preview: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const playhead = useTimelineStore((state) => state.playhead);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(playhead);
    }
  }, [playhead]);

  return (
    <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#000' }}>
      <Player
        ref={playerRef}
        component={CompositionBuilder}
        durationInFrames={1800}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: '100%',
          maxHeight: '100%',
          aspectRatio: '16/9',
        }}
        controls
      />
    </Box>
  );
};

export default Preview;
