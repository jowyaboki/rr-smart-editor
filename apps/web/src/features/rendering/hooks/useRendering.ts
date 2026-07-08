import { useRenderingStore } from '../store/renderingStore';

export const useRendering = () => {
  const { jobs, createJob, cancelJob, removeJob } = useRenderingStore();

  return {
    jobs,
    createJob,
    cancelJob,
    removeJob,
    activeJobs: jobs.filter(j => j.status === 'rendering' || j.status === 'pending'),
    completedJobs: jobs.filter(j => j.status === 'completed'),
  };
};
