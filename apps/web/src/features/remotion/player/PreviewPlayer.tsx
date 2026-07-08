import React, { useRef, useEffect, useMemo } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Box } from '@mui/material';
import { RemotionRenderer } from '../renderer/RemotionRenderer';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { CompositionBuilder } from '../engine/CompositionBuilder';
import { RemotionErrorBoundary } from '../components/ErrorBoundary';

export const PreviewPlayer: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const tracks = useTimelineStore((state) => state.tracks);
  const playheadFrame = useTimelineStore((state) => state.playheadFrame);

  const tree = useMemo(() => {
    return CompositionBuilder.build(null, tracks);
  }, [tracks]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.getCurrentFrame() !== playheadFrame) {
      playerRef.current.seekTo(playheadFrame);
    }
  }, [playheadFrame]);

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RemotionErrorBoundary>
        <Player
          ref={playerRef}
          component={RemotionRenderer}
          inputProps={{ tree }}
          durationInFrames={tree.durationInFrames}
          compositionWidth={tree.width}
          compositionHeight={tree.height}
          fps={tree.fps}
          style={{
            width: '100%',
            maxHeight: '100%',
            aspectRatio: '16/9',
          }}
          controls
        />
      </RemotionErrorBoundary>
    </Box>
  );
};
