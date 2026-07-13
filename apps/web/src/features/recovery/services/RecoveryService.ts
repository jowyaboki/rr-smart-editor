import { RecoverySession, RecoveryCandidate, ProjectSnapshot } from '@ai-video-editor/shared';
import { ProjectValidationService } from './ProjectValidationService';
import { SnapshotService } from './SnapshotService';

export class RecoveryService {
  private static readonly RECOVERY_SESSION_PREFIX = 'rr_recovery_session_';

  /**
   * Scans the local environment on startup to identify recovery candidates for a project.
   */
  public static async scanForRecovery(params: {
    projectId: string;
    serverProjectUpdatedAt?: string;
    availableAssets?: any[];
  }): Promise<RecoverySession> {
    const { projectId, serverProjectUpdatedAt, availableAssets = [] } = params;
    const candidates: RecoveryCandidate[] = [];
    const startedAt = new Date().toISOString();
    const sessionId = `rec_sess_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // 1. Detect Unsaved Project / Incomplete Auto-Save
    const latestAutosaveData = localStorage.getItem(`rr_latest_autosave_${projectId}`);
    if (latestAutosaveData) {
      try {
        const autosaveSnapshot = JSON.parse(latestAutosaveData) as ProjectSnapshot;

        // Validate the snapshot
        const validation = ProjectValidationService.validateSnapshotIntegrity(autosaveSnapshot);
        if (validation.isValid) {
          // Compare with server updatedAt if available
          let isNewerThanServer = true;
          if (serverProjectUpdatedAt) {
            const serverTime = new Date(serverProjectUpdatedAt).getTime();
            const autosaveTime = new Date(autosaveSnapshot.createdAt).getTime();
            // Allow a small 1-second margin of error
            isNewerThanServer = autosaveTime > serverTime + 1000;
          }

          if (isNewerThanServer) {
            candidates.push({
              id: `cand_unsaved_${autosaveSnapshot.id}`,
              type: 'unsaved_project',
              projectId,
              source: 'autosave',
              data: autosaveSnapshot,
              timestamp: autosaveSnapshot.createdAt,
              reason:
                'This project has unsaved local changes that are newer than the saved version.',
              canRestore: true,
            });
          }
        } else {
          // If latest autosave exists but is invalid, it is an incomplete or corrupted auto-save!
          candidates.push({
            id: `cand_incomplete_save_${Date.now()}`,
            type: 'incomplete_autosave',
            projectId,
            source: 'autosave',
            data: autosaveSnapshot,
            timestamp: autosaveSnapshot.createdAt || new Date().toISOString(),
            reason: `An auto-save file was detected but it failed integrity checks: ${validation.errors.join(', ')}`,
            canRestore: false,
          });
        }
      } catch (err: any) {
        candidates.push({
          id: `cand_corrupt_autosave_${Date.now()}`,
          type: 'incomplete_autosave',
          projectId,
          source: 'autosave',
          data: null,
          timestamp: new Date().toISOString(),
          reason: `Auto-save parse failure: ${err.message}`,
          canRestore: false,
        });
      }
    }

    // 2. Detect Interrupted Renders
    // Check local storage for any render job that was in progress
    const activeRendersData = localStorage.getItem(`rr_active_renders_${projectId}`);
    if (activeRendersData) {
      try {
        const activeRenders = JSON.parse(activeRendersData) as Array<{
          id: string;
          status: string;
          createdAt: string;
          name?: string;
        }>;
        const interruptedRenders = activeRenders.filter(
          (render) => render.status === 'rendering' || render.status === 'queued',
        );

        interruptedRenders.forEach((render) => {
          candidates.push({
            id: `cand_render_${render.id}`,
            type: 'interrupted_render',
            projectId,
            source: 'render_state',
            data: render,
            timestamp: render.createdAt || new Date().toISOString(),
            reason: `Render job "${render.name || render.id}" was interrupted mid-process due to browser refresh or crash.`,
            canRestore: true, // "Restore" means we can offer to retry or clean it up
          });
        });
      } catch {
        // Ignore parsing errors for render logs
      }
    }

    // 3. Detect Corrupted Snapshots in the project history list
    const snapshotIds = SnapshotService.getSnapshotIndex(projectId);
    snapshotIds.forEach((snapId) => {
      const snap = SnapshotService.getSnapshot(snapId);
      if (snap) {
        const validation = ProjectValidationService.validateSnapshotIntegrity(snap);
        if (!validation.isValid) {
          candidates.push({
            id: `cand_corrupted_snap_${snapId}`,
            type: 'corrupted_snapshot',
            projectId,
            source: 'snapshot',
            data: snap,
            timestamp: snap.createdAt,
            reason: `Snapshot "${snap.name}" (ID: ${snapId}) failed integrity validation: ${validation.errors.join(', ')}`,
            canRestore: false,
          });
        }
      }
    });

    const session: RecoverySession = {
      id: sessionId,
      status: 'active',
      startedAt,
      candidates,
    };

    // Save session locally
    localStorage.setItem(`${this.RECOVERY_SESSION_PREFIX}${projectId}`, JSON.stringify(session));

    return session;
  }

  /**
   * Retrieves the current saved RecoverySession for a project.
   */
  public static getSession(projectId: string): RecoverySession | null {
    const data = localStorage.getItem(`${this.RECOVERY_SESSION_PREFIX}${projectId}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as RecoverySession;
    } catch {
      return null;
    }
  }

  /**
   * Finishes a recovery session and sets its status.
   */
  public static resolveSession(projectId: string, status: 'recovered' | 'discarded'): void {
    const session = this.getSession(projectId);
    if (!session) return;

    session.status = status;
    session.endedAt = new Date().toISOString();

    localStorage.setItem(`${this.RECOVERY_SESSION_PREFIX}${projectId}`, JSON.stringify(session));

    // Cleanup crash marker
    localStorage.removeItem(`rr_latest_autosave_${projectId}`);
    localStorage.removeItem(`rr_active_renders_${projectId}`);
  }

  /**
   * Tracks active render jobs to allow interrupted render detection.
   */
  public static trackRenderJob(
    projectId: string,
    renderJob: { id: string; status: string; name?: string },
  ): void {
    const key = `rr_active_renders_${projectId}`;
    let renders: any[] = [];
    try {
      renders = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      renders = [];
    }

    // Update or add
    const index = renders.findIndex((r) => r.id === renderJob.id);
    const updatedJob = { ...renderJob, createdAt: new Date().toISOString() };
    if (index > -1) {
      renders[index] = { ...renders[index], ...updatedJob };
    } else {
      renders.push(updatedJob);
    }

    localStorage.setItem(key, JSON.stringify(renders));
  }

  /**
   * Clears tracked render jobs on completion.
   */
  public static clearRenderJob(projectId: string, renderId: string): void {
    const key = `rr_active_renders_${projectId}`;
    try {
      const renders = JSON.parse(localStorage.getItem(key) || '[]') as any[];
      const filtered = renders.filter((r) => r.id !== renderId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }
}
