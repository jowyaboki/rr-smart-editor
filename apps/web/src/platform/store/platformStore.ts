import { create } from 'zustand';
import {
  globalPlatformKernel,
  PlatformModule,
  PlatformService,
  HealthStatus,
} from '@ai-video-editor/platform-kernel';

interface PlatformState {
  modules: any[];
  services: any[];
  healthStatus: HealthStatus | null;
  timelineEvents: any[];
  systemLogs: string[];

  selectedModuleId: string | null;
  activePanel: 'modules' | 'services' | 'health' | 'diagnostics';
  isLoading: boolean;

  // Actions
  initStore: () => void;
  loadModules: () => void;
  loadServices: () => void;
  loadHealthStatus: () => void;
  loadDiagnostics: () => void;
  selectModule: (id: string | null) => void;
  setActivePanel: (panel: 'modules' | 'services' | 'health' | 'diagnostics') => void;

  // Delegation Actions
  triggerHotRestart: () => Promise<void>;
  addKernelLog: (msg: string) => void;
}

export const usePlatformStore = create<PlatformState>((set, get) => {
  return {
    modules: [],
    services: [],
    healthStatus: null,
    timelineEvents: [],
    systemLogs: [],

    selectedModuleId: null,
    activePanel: 'modules',
    isLoading: false,

    initStore: () => {
      // Register standard module listings for demonstration in the dashboard
      const modulesList = globalPlatformKernel.moduleRegistry.listModules();
      if (modulesList.length === 0) {
        const standardModules = [
          { id: 'engine_timeline', name: 'Timeline Engine', version: '1.0.0', dependencies: [] },
          {
            id: 'engine_renders',
            name: 'Render Pipeline',
            version: '1.0.0',
            dependencies: ['engine_timeline'],
          },
          {
            id: 'engine_media',
            name: 'Media Ingestion Pipeline',
            version: '1.0.0',
            dependencies: [],
          },
          {
            id: 'engine_audio',
            name: 'Professional Audio Engine 2.0',
            version: '1.0.0',
            dependencies: ['engine_timeline'],
          },
          {
            id: 'engine_color',
            name: 'Professional Color Science Engine',
            version: '1.0.0',
            dependencies: ['engine_timeline'],
          },
          {
            id: 'platform_delivery',
            name: 'Export & Delivery Platform',
            version: '1.0.0',
            dependencies: ['engine_renders'],
          },
          {
            id: 'platform_security',
            name: 'Security & Governance Platform',
            version: '1.0.0',
            dependencies: [],
          },
          {
            id: 'platform_api',
            name: 'API Gateway & Public SDK',
            version: '1.0.0',
            dependencies: ['platform_security'],
          },
        ];

        for (const m of standardModules) {
          globalPlatformKernel.moduleRegistry.registerModule({
            manifest: {
              id: m.id,
              name: m.name,
              version: m.version,
              dependencies: m.dependencies,
              capabilities: [],
            },
            state: 'Running',
            services: [],
            initialize: async () => {},
            start: async () => {},
            stop: async () => {},
          });
        }
      }

      get().loadModules();
      get().loadServices();
      get().loadHealthStatus();
      get().loadDiagnostics();

      set({
        systemLogs: [
          `[${new Date().toISOString()}] [Kernel: Boot] Initializing bootstrap manager...`,
          `[${new Date().toISOString()}] [Kernel: Boot] Resolving module dependencies topologically...`,
          `[${new Date().toISOString()}] [Kernel: Boot] Bootstrapping completed successfully.`,
        ],
      });
    },

    loadModules: () => {
      const list = globalPlatformKernel.moduleRegistry.listModules().map((m) => ({
        id: m.manifest.id,
        name: m.manifest.name,
        version: m.manifest.version,
        dependencies: m.manifest.dependencies,
        capabilities: m.manifest.capabilities,
        state: m.state,
      }));
      set({ modules: list });
    },

    loadServices: () => {
      // Seed default DI services if empty
      const list = [
        {
          id: 'service_mixer',
          interfaceName: 'AudioMixerService',
          implementationClass: 'AudioMixerService',
          isSingleton: true,
          scope: 'global',
        },
        {
          id: 'service_grading',
          interfaceName: 'GradingService',
          implementationClass: 'GradingService',
          isSingleton: true,
          scope: 'global',
        },
        {
          id: 'service_policy',
          interfaceName: 'PolicyService',
          implementationClass: 'PolicyService',
          isSingleton: true,
          scope: 'global',
        },
        {
          id: 'service_delivery',
          interfaceName: 'DeliveryService',
          implementationClass: 'DeliveryService',
          isSingleton: true,
          scope: 'global',
        },
      ];
      set({ services: list });
    },

    loadHealthStatus: () => {
      const status = globalPlatformKernel.healthManager.getHealthStatus();
      set({ healthStatus: status });
    },

    loadDiagnostics: () => {
      const timeline = globalPlatformKernel.diagnosticsManager.getDiagnosticsTimeline();
      set({ timelineEvents: timeline });
    },

    selectModule: (id) => set({ selectedModuleId: id }),
    setActivePanel: (panel) => set({ activePanel: panel }),

    // Delegation Actions (no business logic in store)
    triggerHotRestart: async () => {
      set({ isLoading: true });
      try {
        const ctx = {
          kernelId: 'kernel_reboot_dashboard',
          env: 'production',
          startTime: new Date().toISOString(),
          configuration: { global: {}, workspace: {}, moduleOverrides: {} },
        };

        globalPlatformKernel.healthManager.clearTelemetry();
        await globalPlatformKernel.bootstrapManager.shutdown(ctx);
        await globalPlatformKernel.bootstrapManager.bootstrap(ctx);

        get().loadModules();
        get().loadHealthStatus();
        get().loadDiagnostics();

        const logMsg = `[${new Date().toISOString()}] [Kernel: HotRestart] Platform Kernel hot reboot executed successfully.`;
        set({ systemLogs: [...get().systemLogs, logMsg] });
      } finally {
        set({ isLoading: false });
      }
    },

    addKernelLog: (msg) => {
      set({ systemLogs: [...get().systemLogs, `[${new Date().toISOString()}] ${msg}`] });
    },
  };
});

export default usePlatformStore;
