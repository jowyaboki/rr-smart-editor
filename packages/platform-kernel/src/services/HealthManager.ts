import { HealthStatus, LifecycleState } from '../types';
import { globalModuleRegistry } from './ModuleRegistry';

export class HealthManager {
  private errorsCount = 0;
  private warningsCount = 0;

  public getHealthStatus(): HealthStatus {
    const modules = globalModuleRegistry.listModules();
    const statuses: Record<string, LifecycleState> = {};

    for (const m of modules) {
      statuses[m.manifest.id] = m.state;
    }

    const hasFailed = Object.values(statuses).some((s) => s === 'Failed');
    const status = hasFailed ? 'unhealthy' : this.errorsCount > 0 ? 'degraded' : 'healthy';

    return {
      status,
      errorsCount: this.errorsCount,
      warningsCount: this.warningsCount,
      memoryUsageBytes: process.memoryUsage ? process.memoryUsage().heapUsed : 1024 * 1024 * 45, // default baseline
      moduleStatuses: statuses,
      heartbeatTime: new Date().toISOString(),
    };
  }

  public recordError(errorMsg: string): void {
    this.errorsCount += 1;
  }

  public recordWarning(warnMsg: string): void {
    this.warningsCount += 1;
  }

  public clearTelemetry(): void {
    this.errorsCount = 0;
    this.warningsCount = 0;
  }
}

export const globalHealthManager = new HealthManager();
export default globalHealthManager;
