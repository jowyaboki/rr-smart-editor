import { create } from 'zustand';
import {
  globalDeliveryPlatformEngine,
  DeliveryJob,
  ExportPreset,
  DeliveryResult,
} from '@ai-video-editor/delivery-platform';
import { RenderArtifact } from '@ai-video-editor/shared';

// Define the state structure for Delivery Store
interface DeliveryState {
  // Collection States
  jobs: DeliveryJob[];
  presets: ExportPreset[];
  recentLogs: string[];

  // UI Selection & Filter State
  selectedJobId: string | null;
  selectedJobIds: string[]; // for multi-selection
  selectedPresetId: string | null;
  activePanel: 'queue' | 'presets' | 'destinations' | 'monitoring';
  searchQuery: string;
  statusFilter: 'all' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  sortKey: 'createdAt' | 'progress' | 'projectId';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;

  // Actions (Strictly UI-state / Service Delegators)
  initStore: () => void;
  loadPresets: () => void;
  loadJobs: (projectId?: string) => void;
  selectJob: (jobId: string | null) => void;
  toggleJobSelection: (jobId: string) => void;
  selectPreset: (presetId: string | null) => void;
  setActivePanel: (panel: 'queue' | 'presets' | 'destinations' | 'monitoring') => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (
    filter: 'all' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled',
  ) => void;
  setSort: (key: 'createdAt' | 'progress' | 'projectId', order?: 'asc' | 'desc') => void;

  // Core Service Delegations (No business logic here!)
  submitDeliveryJob: (
    projectId: string,
    artifact: RenderArtifact,
    presetId: string,
  ) => Promise<DeliveryJob>;
  cancelDeliveryJob: (jobId: string) => Promise<void>;
  createCustomPreset: (preset: ExportPreset) => void;
  addLogMessage: (msg: string) => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => {
  // Subscribes to mock/real EventBus and updates state dynamically
  const subscribeToEvents = () => {
    // Standard mock event loop simulating pipeline real-time updates for high-fidelity presentation
    setInterval(() => {
      const { jobs } = get();
      const activeJobs = jobs.filter((j) => j.status === 'processing');

      if (activeJobs.length > 0) {
        // Fetch fresh state from engine for active jobs
        const updatedJobs = jobs.map((j) => {
          const fresh = globalDeliveryPlatformEngine.deliveryService.getJob(j.id);
          return fresh ? { ...fresh } : j;
        });

        // Add some telemetry logs for demonstration purposes
        const logs: string[] = [...get().recentLogs];
        activeJobs.forEach((j) => {
          const fresh = globalDeliveryPlatformEngine.deliveryService.getJob(j.id);
          if (fresh) {
            if (
              fresh.progress > 0 &&
              fresh.progress < 30 &&
              !logs.some((l) => l.includes(`${j.id}: QC`))
            ) {
              logs.push(
                `[${new Date().toISOString()}] [Event: ValidationCompleted] Job ${j.id} QC Passed.`,
              );
            }
            if (
              fresh.progress >= 30 &&
              fresh.progress < 50 &&
              !logs.some((l) => l.includes(`${j.id}: Export`))
            ) {
              logs.push(
                `[${new Date().toISOString()}] [Event: EncodingStarted] Job ${j.id} re-encoding initiated.`,
              );
            }
            if (
              fresh.progress >= 50 &&
              fresh.progress < 75 &&
              !logs.some((l) => l.includes(`${j.id}: Package`))
            ) {
              logs.push(
                `[${new Date().toISOString()}] [Event: PackagingCompleted] Job ${j.id} packaged successfully.`,
              );
            }
            if (
              fresh.progress >= 75 &&
              fresh.progress < 100 &&
              !logs.some((l) => l.includes(`${j.id}: Upload`))
            ) {
              logs.push(
                `[${new Date().toISOString()}] [Event: UploadStarted] Job ${j.id} uploading to destination servers.`,
              );
            }
            if (
              fresh.progress === 100 &&
              !logs.some((l) => l.includes(`${j.id}: DeliveryCompleted`))
            ) {
              logs.push(
                `[${new Date().toISOString()}] [Event: DeliveryCompleted] Job ${j.id} distributed successfully.`,
              );
            }
          }
        });

        set({
          jobs: updatedJobs,
          recentLogs: logs.slice(-50), // keep last 50
        });
      }
    }, 500);
  };

  return {
    jobs: [],
    presets: [],
    recentLogs: [],
    selectedJobId: null,
    selectedJobIds: [],
    selectedPresetId: null,
    activePanel: 'queue',
    searchQuery: '',
    statusFilter: 'all',
    sortKey: 'createdAt',
    sortOrder: 'desc',
    isLoading: false,

    initStore: () => {
      get().loadPresets();
      get().loadJobs();
      subscribeToEvents();
    },

    loadPresets: () => {
      const list = globalDeliveryPlatformEngine.presetService.listPresets();
      set({ presets: list });
    },

    loadJobs: (projectId) => {
      const list = globalDeliveryPlatformEngine.deliveryService.listJobs(projectId);
      set({ jobs: list });
    },

    selectJob: (jobId) => {
      set({ selectedJobId: jobId });
    },

    toggleJobSelection: (jobId) => {
      const { selectedJobIds } = get();
      if (selectedJobIds.includes(jobId)) {
        set({ selectedJobIds: selectedJobIds.filter((id) => id !== jobId) });
      } else {
        set({ selectedJobIds: [...selectedJobIds, jobId] });
      }
    },

    selectPreset: (presetId) => {
      set({ selectedPresetId: presetId });
    },

    setActivePanel: (panel) => {
      set({ activePanel: panel });
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setStatusFilter: (filter) => {
      set({ statusFilter: filter });
    },

    setSort: (key, order) => {
      const currentOrder = get().sortOrder;
      const nextOrder =
        order || (get().sortKey === key ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'desc');
      set({ sortKey: key, sortOrder: nextOrder });
    },

    // Delegate creation to Delivery Platform Services
    submitDeliveryJob: async (projectId, artifact, presetId) => {
      set({ isLoading: true });
      try {
        const job = await globalDeliveryPlatformEngine.deliveryService.submitJob(
          projectId,
          artifact,
          presetId,
          'immediate',
        );

        const updatedJobs = globalDeliveryPlatformEngine.deliveryService.listJobs();
        const logs = [
          ...get().recentLogs,
          `[${new Date().toISOString()}] [Event: DeliveryJobCreated] Submitted Job ${job.id}`,
        ];

        set({
          jobs: updatedJobs,
          selectedJobId: job.id,
          recentLogs: logs,
        });
        return job;
      } finally {
        set({ isLoading: false });
      }
    },

    // Delegate cancel
    cancelDeliveryJob: async (jobId) => {
      const job = globalDeliveryPlatformEngine.deliveryService.getJob(jobId);
      if (job) {
        job.status = 'cancelled';
        job.updatedAt = new Date().toISOString();
        const logs = [
          ...get().recentLogs,
          `[${new Date().toISOString()}] [Event: DeliveryCancelled] Cancelled Job ${jobId}`,
        ];
        set({
          jobs: globalDeliveryPlatformEngine.deliveryService.listJobs(),
          recentLogs: logs,
        });
      }
    },

    // Delegate Preset Register
    createCustomPreset: (preset) => {
      globalDeliveryPlatformEngine.presetService.registerPreset(preset);
      get().loadPresets();
    },

    addLogMessage: (msg) => {
      set({ recentLogs: [...get().recentLogs, `[${new Date().toISOString()}] ${msg}`].slice(-50) });
    },
  };
});
export default useDeliveryStore;
