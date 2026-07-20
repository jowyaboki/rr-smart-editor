import { LogEntry, Metric } from '../../../packages/observability/src/types';

export class ServerObservabilityManager {
  private serverMetrics: Metric[] = [];

  public logServerEvent(level: string, message: string): LogEntry {
    return {
      id: `srv-log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: level as any,
      engine: 'Server Engine',
      component: 'MediaIngestion',
      message,
    };
  }

  public collectServerCpuMetric(): Metric {
    const item: Metric = {
      name: 'server_cpu_usage',
      value: Math.random() * 100,
      timestamp: Date.now(),
      engine: 'Server Engine',
    };
    this.serverMetrics.push(item);
    return item;
  }

  public getServerMetrics(): Metric[] {
    return [...this.serverMetrics];
  }
}
export const serverObservability = new ServerObservabilityManager();
