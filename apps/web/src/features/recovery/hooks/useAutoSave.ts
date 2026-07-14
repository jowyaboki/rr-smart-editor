import { useEffect, useRef } from 'react';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { useRecoveryStore } from '../store/recoveryStore';
import { AutoSaveService } from '../services/AutoSaveService';

export const useAutoSave = (projectId: string, projectName: string) => {
  const registerChange = useRecoveryStore((s) => s.registerChange);
  const setAutoSaveState = useRecoveryStore((s) => s.setAutoSaveState);
  const policy = useRecoveryStore((s) => s.policy);
  const loadPolicy = useRecoveryStore((s) => s.loadPolicy);

  const projectInfoRef = useRef({ projectId, projectName });
  useEffect(() => {
    projectInfoRef.current = { projectId, projectName };
  }, [projectId, projectName]);

  // Load policy on mount
  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  // Subscribe to useTimelineStore changes to register auto-save pokes
  useEffect(() => {
    const unsubscribe = useTimelineStore.subscribe((state, prevState) => {
      // If tracks or playhead changes, register change
      if (JSON.stringify(state.tracks) !== JSON.stringify(prevState.tracks)) {
        AutoSaveService.registerChange();
        registerChange();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [registerChange]);

  // Initialize the AutoSaveService
  useEffect(() => {
    if (!projectId) return;

    AutoSaveService.initialize(
      {
        getProjectData: () => {
          const timelineState = useTimelineStore.getState();
          return {
            projectId: projectInfoRef.current.projectId,
            projectName: projectInfoRef.current.projectName,
            timeline: {
              tracks: timelineState.tracks,
              playhead: timelineState.playhead,
              zoom: timelineState.zoom,
              snap: timelineState.snap,
            },
            assets: [], // Empty or optional
          };
        },
        onStateChange: (state) => {
          setAutoSaveState(state);
        },
        onSaveSuccess: (snapshot) => {
          // Log or notify if needed
        },
        onSaveFailure: (err) => {
          console.error('Autosave failure:', err);
        },
      },
      {
        intervalMs: policy.autoSaveIntervalMs,
        enabled: policy.autoSaveIntervalMs > 0,
      },
    );

    return () => {
      AutoSaveService.destroy();
    };
  }, [projectId, policy.autoSaveIntervalMs, setAutoSaveState]);

  // Sync policy updates to AutoSaveService
  useEffect(() => {
    AutoSaveService.updatePolicy(policy.autoSaveIntervalMs, policy.autoSaveIntervalMs > 0);
  }, [policy.autoSaveIntervalMs]);

  return {
    triggerManualSave: (description?: string) => AutoSaveService.triggerManualSave(description),
    triggerSaveOnRender: (description?: string) => AutoSaveService.triggerSaveOnRender(description),
  };
};
