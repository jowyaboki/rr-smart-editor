import { useEffect, useRef } from 'react';
import { PerformanceProfiler } from '../services/PerformanceProfiler';

export const useRenderProfiler = (componentName: string) => {
  const startTimeRef = useRef<number>(0);

  // Measure initial mount and update rendering duration
  startTimeRef.current = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current;

    // Track in PerformanceProfiler
    PerformanceProfiler.recordMetrics({
      reactRenderTimeMs: Number(renderTime.toFixed(2)),
      timelineRenderTimeMs: 0,
      compositionRebuildTimeMs: 0,
      assetLoadingTimeMs: 0,
    });
  });

  useEffect(() => {
    // Start measuring FPS on mount
    PerformanceProfiler.startFpsTracker();
    return () => {
      PerformanceProfiler.stopFpsTracker();
    };
  }, []);
};
