import { jobStorage } from '../storage/JobStorage';

export class MetricsService {
  public async getQueueMetrics() {
    const jobs = await jobStorage.listJobs();
    const workers = await jobStorage.listWorkers();

    const queuedCount = jobs.filter((j) => j.status === 'queued').length;
    const renderingCount = jobs.filter((j) => j.status === 'rendering').length;
    const completedCount = jobs.filter((j) => j.status === 'completed').length;
    const failedCount = jobs.filter((j) => j.status === 'failed').length;
    const cancelledCount = jobs.filter((j) => j.status === 'cancelled').length;

    const completedJobsWithMetrics = jobs.filter((j) => j.status === 'completed' && j.metrics);
    let avgFps = 0;
    let totalDurationMs = 0;
    if (completedJobsWithMetrics.length > 0) {
      const sumFps = completedJobsWithMetrics.reduce((sum, j) => sum + (j.metrics?.fps || 0), 0);
      avgFps = sumFps / completedJobsWithMetrics.length;
      totalDurationMs = completedJobsWithMetrics.reduce((sum, j) => sum + (j.metrics?.durationMs || 0), 0);
    }

    const activeWorkersCount = workers.filter((w) => w.status !== 'offline').length;
    const busyWorkersCount = workers.filter((w) => w.status === 'busy').length;

    return {
      jobs: {
        total: jobs.length,
        queued: queuedCount,
        rendering: renderingCount,
        completed: completedCount,
        failed: failedCount,
        cancelled: cancelledCount,
        averageFps: parseFloat(avgFps.toFixed(1)),
        totalDurationMs,
      },
      workers: {
        total: workers.length,
        active: activeWorkersCount,
        busy: busyWorkersCount,
        idle: activeWorkersCount - busyWorkersCount,
      },
    };
  }
}

export const metricsService = new MetricsService();
