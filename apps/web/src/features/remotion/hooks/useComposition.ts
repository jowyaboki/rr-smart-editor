import { useMemo } from 'react';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { CompositionBuilder } from '../engine/CompositionBuilder';

export const useComposition = () => {
  const tracks = useTimelineStore((state) => state.tracks);

  const tree = useMemo(() => {
    return CompositionBuilder.build(null, tracks);
  }, [tracks]);

  return { tree };
};
