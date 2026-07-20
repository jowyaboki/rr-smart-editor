import { webMetrics } from '../services';

export const recordCustomMetric = (name: string, value: number, engine: string) => {
  return webMetrics.record(name, value, engine);
};
