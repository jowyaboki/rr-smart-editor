import { ProjectSnapshot, SnapshotMetadata } from '@ai-video-editor/shared';
import { ProjectValidationService } from './ProjectValidationService';

export class SnapshotService {
  private static readonly SNAPSHOT_KEY_PREFIX = 'rr_snapshot_';
  private static readonly INDEX_KEY_PREFIX = 'rr_snapshots_index_';

  /**
   * Builds an immutable snapshot from the given project and associated state context.
   */
  public static createSnapshot(params: {
    projectId: string;
    projectName: string;
    timeline: any;
    assets?: any[];
    scenes?: any[];
    templates?: any;
    brandKit?: any;
    settings?: any;
    trigger: SnapshotMetadata['trigger'];
    description?: string;
  }): ProjectSnapshot {
    const {
      projectId,
      projectName,
      timeline,
      assets = [],
      scenes = [],
      templates = null,
      brandKit = null,
      settings = null,
      trigger,
      description,
    } = params;

    const snapshotId = `snap_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const snapshotData: Omit<ProjectSnapshot, 'metadata'> = {
      id: snapshotId,
      projectId,
      name: projectName,
      createdAt,
      timeline,
      assets,
      scenes,
      templates,
      brandKit,
      settings,
    };

    const hash = ProjectValidationService.generateSnapshotHash(snapshotData);

    const snapshot: ProjectSnapshot = {
      ...snapshotData,
      metadata: {
        trigger,
        version: '1.0',
        hash,
        description,
      },
    };

    return snapshot;
  }

  /**
   * Saves a snapshot to localStorage and registers it in the project's snapshot index.
   */
  public static saveSnapshot(snapshot: ProjectSnapshot): void {
    const { projectId, id: snapshotId } = snapshot;

    // Save individual snapshot data
    localStorage.setItem(`${this.SNAPSHOT_KEY_PREFIX}${snapshotId}`, JSON.stringify(snapshot));

    // Update project index
    const indexKey = `${this.INDEX_KEY_PREFIX}${projectId}`;
    const currentIndex = this.getSnapshotIndex(projectId);

    // Avoid duplicates
    if (!currentIndex.includes(snapshotId)) {
      const updatedIndex = [snapshotId, ...currentIndex];
      localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
    }
  }

  /**
   * Retrieves a snapshot by ID from storage.
   */
  public static getSnapshot(snapshotId: string): ProjectSnapshot | null {
    const data = localStorage.getItem(`${this.SNAPSHOT_KEY_PREFIX}${snapshotId}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as ProjectSnapshot;
    } catch {
      return null;
    }
  }

  /**
   * Deletes a snapshot from storage and updates the index.
   */
  public static deleteSnapshot(snapshotId: string): void {
    const snapshot = this.getSnapshot(snapshotId);
    if (!snapshot) return;

    // Remove from storage
    localStorage.removeItem(`${this.SNAPSHOT_KEY_PREFIX}${snapshotId}`);

    // Update index
    const { projectId } = snapshot;
    const indexKey = `${this.INDEX_KEY_PREFIX}${projectId}`;
    const currentIndex = this.getSnapshotIndex(projectId);
    const updatedIndex = currentIndex.filter((id) => id !== snapshotId);

    localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
  }

  /**
   * Retrieves all snapshots for a specific project.
   */
  public static getProjectSnapshots(projectId: string): ProjectSnapshot[] {
    const index = this.getSnapshotIndex(projectId);
    const snapshots: ProjectSnapshot[] = [];

    index.forEach((snapshotId) => {
      const snap = this.getSnapshot(snapshotId);
      if (snap) {
        snapshots.push(snap);
      } else {
        // Self-heal: If snapshot does not exist but is in index, clean up the index
        this.cleanMissingFromIndex(projectId, snapshotId);
      }
    });

    // Return sorted by creation date descending
    return snapshots.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Gets the list of snapshot IDs for a given project.
   */
  public static getSnapshotIndex(projectId: string): string[] {
    const indexKey = `${this.INDEX_KEY_PREFIX}${projectId}`;
    const data = localStorage.getItem(indexKey);
    if (!data) return [];
    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  /**
   * Removes a missing snapshot ID from the project index.
   */
  private static cleanMissingFromIndex(projectId: string, snapshotId: string): void {
    const indexKey = `${this.INDEX_KEY_PREFIX}${projectId}`;
    const currentIndex = this.getSnapshotIndex(projectId);
    const updatedIndex = currentIndex.filter((id) => id !== snapshotId);
    localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
  }
}
