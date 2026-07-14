import { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualizationService, VisibleRanges } from '../services/VirtualizationService';
import { Track } from '../../../store/useTimelineStore';

export const useTimelineVirtualization = (tracks: Track[], zoom: number) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleRanges, setVisibleRanges] = useState<VisibleRanges>({
    visibleTrackIndices: [],
    visibleClipIds: new Set(),
    virtualizationSavingsPercentage: 0,
  });

  const recalculate = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const bounds = {
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft,
      viewportWidth: el.clientWidth,
      viewportHeight: el.clientHeight,
      totalTracksCount: tracks.length,
    };

    const ranges = VirtualizationService.calculateVisibility({
      bounds,
      tracks,
      zoom,
    });

    setVisibleRanges(ranges);
  }, [tracks, zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    recalculate();

    const handleScroll = () => {
      // Throttle/requestAnimationFrame for perfect 60fps scrolling
      requestAnimationFrame(recalculate);
    };

    el.addEventListener('scroll', handleScroll);

    // Add resize listener
    const resizeObserver = new ResizeObserver(recalculate);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [tracks, zoom, recalculate]);

  return {
    containerRef,
    visibleRanges,
    recalculate,
  };
};
