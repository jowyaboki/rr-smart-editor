import { useMemo } from 'react';
import { useDeveloperApiStore } from '../store/developerApiStore';

export const useDeveloperApi = () => {
  const store = useDeveloperApiStore();

  const filteredKeys = useMemo(() => {
    let list = [...store.apiKeys];
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter((k) => k.name.toLowerCase().includes(q));
    }
    return list;
  }, [store.apiKeys, store.searchQuery]);

  return {
    ...store,
    apiKeys: filteredKeys,
  };
};

export default useDeveloperApi;
