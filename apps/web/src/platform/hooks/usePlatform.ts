import { useMemo } from 'react';
import { usePlatformStore } from '../store/platformStore';

export const usePlatform = () => {
  const store = usePlatformStore();

  const filteredModules = useMemo(() => {
    return store.modules;
  }, [store.modules]);

  return {
    ...store,
    modules: filteredModules,
  };
};

export default usePlatform;
