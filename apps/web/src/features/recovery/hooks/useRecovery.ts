import { useCallback } from 'react';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { useRecoveryStore } from '../store/recoveryStore';
import { ProjectSnapshot } from '@ai-video-editor/shared';
import { ProjectValidationService } from '../services/ProjectValidationService';

export const useRecovery = (projectId: string) => {
  const activeSession = useRecoveryStore((s) => s.activeSession);
  const scanForRecovery = useRecoveryStore((s) => s.scanForRecovery);
  const resolveSession = useRecoveryStore((s) => s.resolveSession);
  const snapshots = useRecoveryStore((s) => s.snapshots);
  const loadSnapshots = useRecoveryStore((s) => s.loadSnapshots);
  const deleteSnapshot = useRecoveryStore((s) => s.deleteSnapshot);
  const compareSnapshots = useRecoveryStore((s) => s.compareSnapshots);
  const lastComparison = useRecoveryStore((s) => s.lastComparison);
  const addNotification = useRecoveryStore((s) => s.addNotification);

  /**
   * Restores a snapshot back into the editor's live state after thorough validation.
   */
  const restoreSnapshot = useCallback(
    (snapshot: ProjectSnapshot): boolean => {
      // 1. Validate the snapshot before restoring to protect state integrity
      const validation = ProjectValidationService.validateSnapshotIntegrity(snapshot);
      if (!validation.isValid) {
        addNotification(`Restore failed: ${validation.errors.join(', ')}`, 'error');
        return false;
      }

      // 2. Load into standard stores (useTimelineStore)
      try {
        const { timeline } = snapshot;

        useTimelineStore.setState({
          tracks: timeline.tracks || [],
          playhead: timeline.playhead || 0,
          zoom: timeline.zoom || 1,
          snap: typeof timeline.snap === 'boolean' ? timeline.snap : true,
        });

        addNotification(
          `Successfully restored snapshot from ${new Date(snapshot.createdAt).toLocaleString()}`,
          'success',
        );
        return true;
      } catch (err: any) {
        addNotification(`Failed to apply snapshot to timeline: ${err.message}`, 'error');
        return false;
      }
    },
    [addNotification],
  );

  /**
   * Helper to perform startup scan.
   */
  const performStartupScan = useCallback(
    async (serverProjectUpdatedAt?: string, availableAssets?: any[]) => {
      if (!projectId) return null;
      return scanForRecovery({
        projectId,
        serverProjectUpdatedAt,
        availableAssets,
      });
    },
    [projectId, scanForRecovery],
  );

  return {
    activeSession,
    snapshots,
    lastComparison,
    scanForRecovery: performStartupScan,
    resolveSession: useCallback(
      (status: 'recovered' | 'discarded') => resolveSession(projectId, status),
      [projectId, resolveSession],
    ),
    loadSnapshots: useCallback(() => loadSnapshots(projectId), [projectId, loadSnapshots]),
    deleteSnapshot,
    compareSnapshots,
    restoreSnapshot,
  };
};
