import { ProjectSnapshot, RecoveryPolicy } from '@ai-video-editor/shared';
import { SnapshotService } from './SnapshotService';

export interface SnapshotDiff {
  projectId: string;
  snapAId: string;
  snapBId: string;
  nameChanged: boolean;
  nameChange?: { from: string; to: string };
  timelineChanged: boolean;
  addedClips: any[];
  removedClips: any[];
  modifiedClips: Array<{
    id: string;
    name: string;
    changes: string[];
  }>;
  assetCountDifference: number;
  createdAtDiffMinutes: number;
}

export class HistoryCleanupService {
  /**
   * Cleans up snapshots for a project according to the given retention policy.
   */
  public static cleanProjectHistory(
    projectId: string,
    policy: RecoveryPolicy,
  ): { deletedCount: number; remainingCount: number } {
    const snapshots = SnapshotService.getProjectSnapshots(projectId);
    let deletedCount = 0;

    if (snapshots.length === 0) {
      return { deletedCount: 0, remainingCount: 0 };
    }

    const now = new Date().getTime();
    const retentionMs = policy.retentionDays * 24 * 60 * 60 * 1000;

    // We'll iterate and keep track of snapshots to delete
    const snapshotsToDelete = new Set<string>();

    // 1. Enforce Retention Days (Only if retentionDays > 0)
    if (policy.retentionDays > 0) {
      snapshots.forEach((snap) => {
        const ageMs = now - new Date(snap.createdAt).getTime();
        if (ageMs > retentionMs) {
          snapshotsToDelete.add(snap.id);
        }
      });
    }

    // 2. Enforce Max Snapshots (Always keep at least the latest ones)
    // Filter out snapshots that are already marked for deletion to see what's left
    const remainingAfterRetention = snapshots.filter((snap) => !snapshotsToDelete.has(snap.id));

    if (policy.maxSnapshots > 0 && remainingAfterRetention.length > policy.maxSnapshots) {
      // Since they are sorted descending (latest first), we keep the first `maxSnapshots`
      const excess = remainingAfterRetention.slice(policy.maxSnapshots);
      excess.forEach((snap) => {
        snapshotsToDelete.add(snap.id);
      });
    }

    // Delete marked snapshots
    snapshotsToDelete.forEach((snapId) => {
      SnapshotService.deleteSnapshot(snapId);
      deletedCount++;
    });

    const finalSnapshots = SnapshotService.getProjectSnapshots(projectId);

    return {
      deletedCount,
      remainingCount: finalSnapshots.length,
    };
  }

  /**
   * Compares two snapshots and produces a structural diff.
   */
  public static compareSnapshots(snapA: ProjectSnapshot, snapB: ProjectSnapshot): SnapshotDiff {
    const addedClips: any[] = [];
    const removedClips: any[] = [];
    const modifiedClips: Array<{ id: string; name: string; changes: string[] }> = [];

    const getClipsMap = (snapshot: ProjectSnapshot) => {
      const map = new Map<string, any>();
      const tracks = snapshot.timeline?.tracks || [];
      tracks.forEach((track: any) => {
        if (Array.isArray(track.clips)) {
          track.clips.forEach((clip: any) => {
            map.set(clip.id, clip);
          });
        }
      });
      return map;
    };

    const clipsA = getClipsMap(snapA);
    const clipsB = getClipsMap(snapB);

    // Find added and modified clips (in B but not in A, or changed)
    clipsB.forEach((clipB, id) => {
      const clipA = clipsA.get(id);
      if (!clipA) {
        addedClips.push(clipB);
      } else {
        // Compare fields
        const changes: string[] = [];
        if (clipA.start !== clipB.start) {
          changes.push(`start frame: ${clipA.start} -> ${clipB.start}`);
        }
        if (clipA.duration !== clipB.duration) {
          changes.push(`duration: ${clipA.duration} -> ${clipB.duration}`);
        }
        if (clipA.name !== clipB.name) {
          changes.push(`name: "${clipA.name}" -> "${clipB.name}"`);
        }
        if (clipA.url !== clipB.url) {
          changes.push(`url changed`);
        }
        if (clipA.content !== clipB.content) {
          changes.push(`text content: "${clipA.content || ''}" -> "${clipB.content || ''}"`);
        }

        if (changes.length > 0) {
          modifiedClips.push({
            id,
            name: clipB.name || clipB.id,
            changes,
          });
        }
      }
    });

    // Find removed clips (in A but not in B)
    clipsA.forEach((clipA, id) => {
      if (!clipsB.has(id)) {
        removedClips.push(clipA);
      }
    });

    const timeDiffMs = Math.abs(
      new Date(snapB.createdAt).getTime() - new Date(snapA.createdAt).getTime(),
    );

    return {
      projectId: snapA.projectId,
      snapAId: snapA.id,
      snapBId: snapB.id,
      nameChanged: snapA.name !== snapB.name,
      nameChange: snapA.name !== snapB.name ? { from: snapA.name, to: snapB.name } : undefined,
      timelineChanged: addedClips.length > 0 || removedClips.length > 0 || modifiedClips.length > 0,
      addedClips,
      removedClips,
      modifiedClips,
      assetCountDifference: Math.abs((snapB.assets?.length || 0) - (snapA.assets?.length || 0)),
      createdAtDiffMinutes: Math.round(timeDiffMs / 1000 / 60),
    };
  }
}
