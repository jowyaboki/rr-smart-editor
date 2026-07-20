import { webTracer } from '../services';

export const listActiveTraces = () => {
  return webTracer.listTraces();
};
