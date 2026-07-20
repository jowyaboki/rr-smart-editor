import { webProfiler } from '../services';

export const listProfilerSnapshots = () => {
  return webProfiler.getSnapshots();
};
