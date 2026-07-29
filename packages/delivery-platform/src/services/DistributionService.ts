import { MediaPackage, Destination, DistributionTask } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class DistributionService {
  private activeTasks: Map<string, DistributionTask> = new Map();

  public async deliver(
    mediaPackage: MediaPackage,
    destination: Destination,
    onProgress?: (task: DistributionTask) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const taskId = `dist_task_${Math.random().toString(36).substr(2, 9)}`;

    const task: DistributionTask = {
      id: taskId,
      jobId: mediaPackage.manifestId,
      destinationId: destination.id,
      status: 'queued',
      progress: 0,
      retryCount: 0,
      startedAt: new Date().toISOString(),
    };

    this.activeTasks.set(taskId, task);

    // Check if plugin provider exists for destination type
    const providers = globalDeliveryPluginRegistry.listDeliveryProviders();
    for (const prov of providers) {
      if (prov.supportedTypes.includes(destination.type)) {
        try {
          task.status = 'uploading';
          if (onProgress) onProgress(task);

          const result = await prov.deliver(mediaPackage, destination, (progress, bandwidth, eta) => {
            task.progress = progress;
            task.bandwidthBytesPerSec = bandwidth;
            task.etaSeconds = eta;
            if (onProgress) onProgress(task);
          });

          if (result.success) {
            task.status = 'completed';
            task.progress = 100;
            task.completedAt = new Date().toISOString();
            if (onProgress) onProgress(task);
            return result;
          } else {
            task.status = 'failed';
            task.error = result.error;
            if (onProgress) onProgress(task);
            return result;
          }
        } catch (err: any) {
          task.status = 'failed';
          task.error = err.message;
          if (onProgress) onProgress(task);
          return { success: false, error: err.message };
        }
      }
    }

    // Default simulation upload logic
    task.status = 'uploading';
    if (onProgress) onProgress(task);

    const maxRetries = destination.retryPolicy?.maxRetries ?? 2;
    const retryDelay = destination.retryPolicy?.delayMs ?? 10;

    let success = false;
    let url: string | undefined;
    let errorMsg: string | undefined;

    // Simulate upload progress steps, with potential retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      task.retryCount = attempt;
      if (attempt > 0) {
        task.status = 'uploading';
        task.error = undefined;
        if (onProgress) onProgress(task);
      }

      try {
        const totalSteps = 4;
        let interrupted = false;

        for (let step = 1; step <= totalSteps; step++) {
          // Check for simulated interrupted upload
          if (destination.config.simulateInterrupted && attempt < maxRetries && step === 2) {
            interrupted = true;
            throw new Error('Network connection reset unexpectedly');
          }

          // Check for permanent simulated failure
          if (destination.config.simulateFailure && step === 2) {
            throw new Error(`Upload failed: ${destination.config.simulateFailure}`);
          }

          const bandwidth = destination.config.simulateBandwidth ?? 1024 * 1024 * 5; // default 5MB/s
          task.progress = (step / totalSteps) * 100;
          task.bandwidthBytesPerSec = bandwidth;
          task.etaSeconds = ((totalSteps - step) * 100) / bandwidth;

          if (onProgress) onProgress(task);
          await new Promise((r) => setTimeout(r, 10)); // simulated transfer step
        }

        if (!interrupted) {
          success = true;
          url = `${destination.type}://delivery-platform/packages/${mediaPackage.id}`;
          break;
        }
      } catch (err: any) {
        errorMsg = err.message;
        task.status = 'failed';
        task.error = errorMsg;
        if (onProgress) onProgress(task);

        if (attempt < maxRetries) {
          // wait and retry
          await new Promise((r) => setTimeout(r, retryDelay));
        }
      }
    }

    if (success) {
      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date().toISOString();
      if (onProgress) onProgress(task);
      return { success: true, url };
    } else {
      task.status = 'failed';
      task.error = errorMsg;
      if (onProgress) onProgress(task);
      return { success: false, error: errorMsg };
    }
  }

  public getTask(id: string): DistributionTask | undefined {
    return this.activeTasks.get(id);
  }

  public listTasks(): DistributionTask[] {
    return Array.from(this.activeTasks.values());
  }
}

export const globalDistributionService = new DistributionService();
