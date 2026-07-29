import { useMemo } from 'react';
import { useDeliveryStore } from '../store/deliveryStore';
import { DeliveryJob } from '@ai-video-editor/delivery-platform';

export const useDelivery = () => {
  const store = useDeliveryStore();

  const filteredAndSortedJobs = useMemo(() => {
    let list = [...store.jobs];

    // 1. Search Query Filter
    if (store.searchQuery) {
      const q = store.searchQuery.toLowerCase();
      list = list.filter(
        (job) =>
          job.id.toLowerCase().includes(q) ||
          job.projectId.toLowerCase().includes(q) ||
          job.presetId.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (store.statusFilter !== 'all') {
      list = list.filter((job) => job.status === store.statusFilter);
    }

    // 3. Sorting
    list.sort((a, b) => {
      let valA: any = a[store.sortKey];
      let valB: any = b[store.sortKey];

      if (store.sortKey === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (valA < valB) return store.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return store.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [store.jobs, store.searchQuery, store.statusFilter, store.sortKey, store.sortOrder]);

  return {
    ...store,
    jobs: filteredAndSortedJobs,
    rawJobs: store.jobs, // Keep original list if needed
  };
};
export default useDelivery;
