import { useMemo } from 'react';
import { useSecurityStore } from '../store/securityStore';

export const useSecurity = () => {
  const store = useSecurityStore();

  const filteredPolicies = useMemo(() => {
    let list = [...store.policies];
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [store.policies, store.searchQuery]);

  const activeAlerts = useMemo(() => {
    return store.alerts.filter((a) => a.status === 'active');
  }, [store.alerts]);

  return {
    ...store,
    filteredPolicies,
    activeAlerts,
  };
};

export default useSecurity;
