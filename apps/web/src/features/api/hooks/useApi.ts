import { useMemo } from 'react';
import { useApiStore } from '../store/apiStore';

export const useApi = () => {
  const store = useApiStore();

  const filteredKeys = useMemo(() => {
    return store.apiKeys;
  }, [store.apiKeys]);

  return {
    ...store,
    apiKeys: filteredKeys,
  };
};

export default useApi;
