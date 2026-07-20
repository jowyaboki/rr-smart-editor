import { webHealth } from '../services';

export const getDashboardOverview = async () => {
  const healths = await webHealth.evaluateAll();
  return {
    totalEngines: healths.length,
    healthyCount: healths.filter(h => h.status === 'healthy').length,
    degradedCount: healths.filter(h => h.status === 'degraded').length,
    unhealthyCount: healths.filter(h => h.status === 'unhealthy').length,
    timestamp: Date.now(),
  };
};
