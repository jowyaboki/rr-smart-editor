import { AutoSaveState, ProjectSnapshot, SnapshotMetadata } from '@ai-video-editor/shared';
import { SnapshotService } from './SnapshotService';

export interface AutoSaveConfig {
  getProjectData: () => {
    projectId: string;
    projectName: string;
    timeline: any;
    assets?: any[];
    scenes?: any[];
    templates?: any;
    brandKit?: any;
    settings?: any;
  } | null;
  onSaveSuccess?: (snapshot: ProjectSnapshot) => void;
  onSaveFailure?: (error: Error) => void;
  onStateChange?: (state: AutoSaveState) => void;
}

export class AutoSaveService {
  private static timerId: any = null;
  private static config: AutoSaveConfig | null = null;
  private static state: AutoSaveState = {
    lastSavedAt: null,
    status: 'idle',
    pendingChangesCount: 0,
    intervalMs: 30000, // 30s default
    enabled: true,
  };

  /**
   * Initializes the AutoSaveService with necessary accessor functions.
   */
  public static initialize(
    config: AutoSaveConfig,
    initialPolicy?: { intervalMs?: number; enabled?: boolean },
  ): void {
    this.config = config;
    this.state.intervalMs = initialPolicy?.intervalMs ?? this.state.intervalMs;
    this.state.enabled = initialPolicy?.enabled ?? this.state.enabled;

    // Set up window close listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.notifyStateChange();

    if (this.state.enabled) {
      this.startTimer();
    }
  }

  /**
   * Updates configuration policy dynamically.
   */
  public static updatePolicy(intervalMs: number, enabled: boolean): void {
    const policyChanged = this.state.intervalMs !== intervalMs || this.state.enabled !== enabled;
    this.state.intervalMs = intervalMs;
    this.state.enabled = enabled;

    if (policyChanged) {
      this.stopTimer();
      if (enabled) {
        this.startTimer();
      }
      this.notifyStateChange();
    }
  }

  /**
   * Starts the time-based periodic save.
   */
  public static startTimer(): void {
    this.stopTimer();
    if (!this.state.enabled) return;

    this.timerId = setInterval(() => {
      this.save('autosave');
    }, this.state.intervalMs);
  }

  /**
   * Stops the time-based periodic save.
   */
  public static stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Pokes the service on changes to increment change-based save tracking.
   */
  public static registerChange(): void {
    this.state.pendingChangesCount += 1;
    this.state.status = 'idle';
    this.notifyStateChange();
  }

  /**
   * Triggers a manual save immediately.
   */
  public static triggerManualSave(description?: string): Promise<ProjectSnapshot | null> {
    return this.save('manual', description);
  }

  /**
   * Triggers a save on render.
   */
  public static triggerSaveOnRender(description?: string): Promise<ProjectSnapshot | null> {
    return this.save('render', description || 'Pre-render snapshot');
  }

  /**
   * Cleans up listeners and timers.
   */
  public static destroy(): void {
    this.stopTimer();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.config = null;
  }

  /**
   * Core save logic that creates, saves and validates the project snapshot.
   */
  private static async save(
    trigger: SnapshotMetadata['trigger'],
    description?: string,
  ): Promise<ProjectSnapshot | null> {
    if (!this.config) return null;

    const projectData = this.config.getProjectData();
    if (!projectData) return null;

    // If periodic autosave but no changes, don't waste storage
    if (
      trigger === 'autosave' &&
      this.state.pendingChangesCount === 0 &&
      this.state.lastSavedAt !== null
    ) {
      return null;
    }

    this.state.status = 'saving';
    this.notifyStateChange();

    try {
      const snapshot = SnapshotService.createSnapshot({
        projectId: projectData.projectId,
        projectName: projectData.projectName,
        timeline: projectData.timeline,
        assets: projectData.assets,
        scenes: projectData.scenes,
        templates: projectData.templates,
        brandKit: projectData.brandKit,
        settings: projectData.settings,
        trigger,
        description,
      });

      // Save using SnapshotService
      SnapshotService.saveSnapshot(snapshot);

      // Save latest autosave to a special single key for crash recovery
      localStorage.setItem(`rr_latest_autosave_${projectData.projectId}`, JSON.stringify(snapshot));

      // Reset change counter on successful save
      this.state.pendingChangesCount = 0;
      this.state.lastSavedAt = new Date().toISOString();
      this.state.status = 'success';
      this.notifyStateChange();

      if (this.config.onSaveSuccess) {
        this.config.onSaveSuccess(snapshot);
      }

      return snapshot;
    } catch (err: any) {
      this.state.status = 'failed';
      this.notifyStateChange();

      if (this.config.onSaveFailure) {
        this.config.onSaveFailure(err);
      }
      return null;
    }
  }

  /**
   * Event listener for beforeunload (Save on close).
   */
  private static handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // Attempt a fast synchronous snapshot save to localStorage
    if (this.config && this.state.pendingChangesCount > 0) {
      const projectData = this.config.getProjectData();
      if (projectData) {
        try {
          const snapshot = SnapshotService.createSnapshot({
            projectId: projectData.projectId,
            projectName: projectData.projectName,
            timeline: projectData.timeline,
            assets: projectData.assets,
            scenes: projectData.scenes,
            templates: projectData.templates,
            brandKit: projectData.brandKit,
            settings: projectData.settings,
            trigger: 'close',
            description: 'Save on close',
          });
          SnapshotService.saveSnapshot(snapshot);
          localStorage.setItem(
            `rr_latest_autosave_${projectData.projectId}`,
            JSON.stringify(snapshot),
          );
        } catch (err) {
          console.error('Failed to perform save on close:', err);
        }
      }
    }
  };

  /**
   * Dispatches state changes to listeners.
   */
  private static notifyStateChange(): void {
    if (this.config?.onStateChange) {
      this.config.onStateChange({ ...this.state });
    }
  }

  /**
   * Gets current state copy.
   */
  public static getState(): AutoSaveState {
    return { ...this.state };
  }
}
