import { useEffect, useRef } from 'react';
import { useVirtualProductionStore } from '../store/virtualProductionStore';

export function useVirtualProduction() {
  const { tickTime, studio } = useVirtualProductionStore();
  const rAFRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Tick studio animation and solved constraint rigs
      tickTime(delta);

      rAFRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = Date.now();
    rAFRef.current = requestAnimationFrame(loop);

    return () => {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [tickTime]);

  return {
    isStudioLoaded: !!studio,
    camerasCount: studio ? Object.keys(studio.cameras).length : 0,
    lightsCount: studio ? Object.keys(studio.lightRigs).length : 0,
    activeVirtualSet:
      studio && studio.activeVirtualSetId ? studio.virtualSets[studio.activeVirtualSetId] : null,
  };
}
