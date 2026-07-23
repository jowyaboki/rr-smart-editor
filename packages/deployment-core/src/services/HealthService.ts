import { IHealthService, HealthReport, HealthStatus, DeploymentMode } from '../types';

export class HealthService implements IHealthService {
  private mode: DeploymentMode;

  constructor(mode: DeploymentMode = 'development') {
    this.mode = mode;
  }

  public async getLiveness(): Promise<{ status: HealthStatus }> {
    return { status: 'healthy' };
  }

  public async getReadiness(): Promise<HealthReport> {
    return {
      status: 'healthy',
      version: '1.0.0',
      mode: this.mode,
      uptimeSec: 3600,
      dependencies: {
        database: { name: 'Postgres RDS', status: 'healthy', latencyMs: 3 },
        storage: { name: 'S3 compatible Asset storage', status: 'healthy', latencyMs: 12 },
        queue: { name: 'RabbitMQ Render Queue', status: 'healthy', latencyMs: 5 },
        workers: { name: 'Node rendering workers', status: 'healthy', latencyMs: 2 },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
