import { BackgroundTask } from '@ai-video-editor/shared';

export class SchedulerService {
  private static tasks = new Map<
    string,
    BackgroundTask & { job: () => Promise<void>; cancelTriggered?: boolean }
  >();

  /**
   * Enqueues a cancellable background task.
   */
  public static enqueueTask(
    name: string,
    chunkRunner: (
      updateProgress: (prog: number) => void,
      isCancelled: () => boolean,
    ) => Promise<void>,
  ): string {
    const taskId = `task_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    const taskEntry = {
      id: taskId,
      name,
      status: 'pending' as const,
      progress: 0,
      createdAt: Date.now(),
      job: async () => {
        const t = this.tasks.get(taskId);
        if (!t || t.status === 'cancelled') return;

        t.status = 'running';

        try {
          await chunkRunner(
            (progress) => {
              const current = this.tasks.get(taskId);
              if (current) current.progress = Math.min(100, Math.max(0, progress));
            },
            () => {
              const current = this.tasks.get(taskId);
              return !!current?.cancelTriggered;
            },
          );

          const final = this.tasks.get(taskId);
          if (final) {
            if (final.cancelTriggered) {
              final.status = 'cancelled';
            } else {
              final.status = 'completed';
              final.progress = 100;
            }
          }
        } catch (err) {
          const final = this.tasks.get(taskId);
          if (final) final.status = 'failed';
          console.error(`Scheduler background task ${name} failed:`, err);
        }
      },
    };

    this.tasks.set(taskId, taskEntry);

    // Trigger task execution off-thread asynchronously
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => taskEntry.job());
    } else {
      setTimeout(() => taskEntry.job(), 0);
    }

    return taskId;
  }

  /**
   * Cancels an active task.
   */
  public static cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.cancelTriggered = true;
      if (task.status === 'pending') {
        task.status = 'cancelled';
      }
    }
  }

  /**
   * Gets the status of a background task.
   */
  public static getTaskStatus(taskId: string): BackgroundTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      progress: task.progress,
      createdAt: task.createdAt,
    };
  }

  /**
   * Returns lists of background tasks.
   */
  public static getAllTasks(): BackgroundTask[] {
    return Array.from(this.tasks.values()).map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      progress: t.progress,
      createdAt: t.createdAt,
    }));
  }

  /**
   * Yields control of execution to the main thread to prevent UI freezing.
   */
  public static yieldToMainThread(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  }
}
