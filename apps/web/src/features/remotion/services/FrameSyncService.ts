export const FrameSyncService = {
  syncPlayhead(currentFrame: number, playerRef: any) {
    if (playerRef.current) {
      playerRef.current.seekTo(currentFrame);
    }
  }
};
