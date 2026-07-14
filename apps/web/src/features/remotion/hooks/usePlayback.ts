import { useTimelineStore } from '@/features/timeline/store/timelineStore';

export const usePlayback = () => {
  const { playheadFrame, setPlayhead } = useTimelineStore();

  return {
    currentFrame: playheadFrame,
    seekTo: setPlayhead,
  };
};
