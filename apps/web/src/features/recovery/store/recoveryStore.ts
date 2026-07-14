import { create } from 'zustand';
import {
  RecoveryPolicy,
  AutoSaveState,
  RecoverySession,
  ProjectSnapshot,
} from '@ai-video-editor/shared';
import { ProjectValidationService } from '../services/ProjectValidationService';
import { SnapshotService } from '../services/SnapshotService';
import { RecoveryService } from '../services/RecoveryService';
import { HistoryCleanupService, SnapshotDiff } from '../services/HistoryCleanupService';

export interface RecoveryStoreState {
  policy: RecoveryPolicy;
  autoSaveState: AutoSaveState;
  activeSession: RecoverySession | null;
  snapshots: ProjectSnapshot[];
  lastComparison: SnapshotDiff | null;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>;

  // Policy actions
  setPolicy: (policy: Partial<RecoveryPolicy>) => void;
  loadPolicy: () => RecoveryPolicy;

  // AutoSave actions
  setAutoSaveState: (state: Partial<AutoSaveState>) => void;
  registerChange: () => void;

  // Snapshot actions
  loadSnapshots: (projectId: string) => void;
  createSnapshot: (params: {
    projectId: string;
    projectName: string;
    timeline: any;
    assets?: any[];
    scenes?: any[];
    templates?: any;
    brandKit?: any;
    settings?: any;
    trigger: ProjectSnapshot['metadata']['trigger'];
    description?: string;
  }) => ProjectSnapshot | null;
  deleteSnapshot: (snapshotId: string) => void;
  compareSnapshots: (snapA: ProjectSnapshot, snapB: ProjectSnapshot) => SnapshotDiff;

  // Recovery actions
  scanForRecovery: (params: {
    projectId: string;
    serverProjectUpdatedAt?: string;
    availableAssets?: any[];
  }) => Promise<RecoverySession | null>;
  resolveSession: (projectId: string, status: 'recovered' | 'discarded') => void;

  // Notification actions
  addNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
}

const DEFAULT_POLICY: RecoveryPolicy = {
  autoSaveIntervalMs: 30000,
  maxSnapshots: 20,
  retentionDays: 7,
  cleanupOnStartup: true,
  recoveryBehavior: 'prompt',
};

export const useRecoveryStore = create<RecoveryStoreState>((set, get) => ({
  policy: DEFAULT_POLICY,
  autoSaveState: {
    lastSavedAt: null,
    status: 'idle',
    pendingChangesCount: 0,
    intervalMs: 30000,
    enabled: true,
  },
  activeSession: null,
  snapshots: [],
  lastComparison: null,
  notifications: [],

  setPolicy: (updates) => {
    set((state) => {
      const newPolicy = { ...state.policy, ...updates };
      localStorage.setItem('rr_recovery_policy', JSON.stringify(newPolicy));
      return { policy: newPolicy };
    });
  },

  loadPolicy: () => {
    const saved = localStorage.getItem('rr_recovery_policy');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as RecoveryPolicy;
        set({ policy: parsed });
        return parsed;
      } catch {
        // Fallback to default
      }
    }
    return get().policy;
  },

  setAutoSaveState: (updates) => {
    set((state) => ({
      autoSaveState: { ...state.autoSaveState, ...updates },
    }));
  },

  registerChange: () => {
    set((state) => ({
      autoSaveState: {
        ...state.autoSaveState,
        pendingChangesCount: state.autoSaveState.pendingChangesCount + 1,
        status: 'idle',
      },
    }));
  },

  loadSnapshots: (projectId) => {
    const snaps = SnapshotService.getProjectSnapshots(projectId);
    set({ snapshots: snaps });
  },

  createSnapshot: (params) => {
    try {
      const snap = SnapshotService.createSnapshot(params);
      SnapshotService.saveSnapshot(snap);

      // Enforce history constraints
      const policy = get().policy;
      HistoryCleanupService.cleanProjectHistory(params.projectId, policy);

      // Reload lists
      get().loadSnapshots(params.projectId);
      get().addNotification(`Snapshot "${snap.name}" created successfully.`, 'success');
      return snap;
    } catch (err: any) {
      get().addNotification(`Failed to create snapshot: ${err.message}`, 'error');
      return null;
    }
  },

  deleteSnapshot: (snapshotId) => {
    const snapshot = SnapshotService.getSnapshot(snapshotId);
    if (!snapshot) return;

    SnapshotService.deleteSnapshot(snapshotId);
    get().loadSnapshots(snapshot.projectId);
    get().addNotification('Snapshot deleted successfully.', 'info');
  },

  compareSnapshots: (snapA, snapB) => {
    const diff = HistoryCleanupService.compareSnapshots(snapA, snapB);
    set({ lastComparison: diff });
    return diff;
  },

  scanForRecovery: async (params) => {
    const { projectId, serverProjectUpdatedAt, availableAssets } = params;

    // Clean up history on startup if policy indicates
    const policy = get().policy;
    if (policy.cleanupOnStartup) {
      HistoryCleanupService.cleanProjectHistory(projectId, policy);
    }

    const session = await RecoveryService.scanForRecovery({
      projectId,
      serverProjectUpdatedAt,
      availableAssets,
    });

    set({ activeSession: session });
    get().loadSnapshots(projectId);

    return session;
  },

  resolveSession: (projectId, status) => {
    RecoveryService.resolveSession(projectId, status);
    set({ activeSession: null });
    get().addNotification(
      status === 'recovered'
        ? 'Recovery completed successfully.'
        : 'Recovery candidates discarded.',
      status === 'recovered' ? 'success' : 'info',
    );
  },

  addNotification: (message, type) => {
    const id = `notif_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
