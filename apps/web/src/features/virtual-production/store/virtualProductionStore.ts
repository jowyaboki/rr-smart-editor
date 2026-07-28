import { create } from 'zustand';
import { VirtualStudio, UIViewportState, VirtualCamera, LightRig, Environment, TrackingSource, CalibrationProfile } from '../types';
import { globalVirtualStudioEngine } from '@ai-video-editor/virtual-production';

interface VirtualProductionState {
  studio: VirtualStudio | null;
  viewportState: UIViewportState;
  selectedCameraId: string | null;
  selectedLightId: string | null;
  activeTrackerId: string | null;
  activeMocapId: string | null;
  timeSeconds: number;

  // Actions
  setStudio: (studio: VirtualStudio) => void;
  updateViewportState: (viewport: Partial<UIViewportState>) => void;
  selectCamera: (id: string | null) => void;
  selectLight: (id: string | null) => void;
  selectTracker: (id: string | null) => void;
  selectMocap: (id: string | null) => void;
  tickTime: (deltaSeconds: number) => void;

  // Transaction Wrappers (Strict state updates producing transactions)
  addCamera: (camera: VirtualCamera) => void;
  removeCamera: (id: string) => void;
  addLight: (light: LightRig) => void;
  updateLight: (id: string, updates: Partial<LightRig>) => void;
  updateEnvironment: (updates: Partial<Environment>) => void;
  addTracker: (tracker: TrackingSource) => void;
}

export const useVirtualProductionStore = create<VirtualProductionState>((set, get) => ({
  studio: null,
  viewportState: {
    showGrid: true,
    showFrustums: true,
    showLightCones: true,
    viewMode: 'perspective_3d',
    zoom: 1.0,
  },
  selectedCameraId: null,
  selectedLightId: null,
  activeTrackerId: null,
  activeMocapId: null,
  timeSeconds: 0,

  setStudio: (studio) => set({ studio }),

  updateViewportState: (viewport) => set((state) => ({
    viewportState: { ...state.viewportState, ...viewport },
  })),

  selectCamera: (id) => set({ selectedCameraId: id }),
  selectLight: (id) => set({ selectedLightId: id }),
  selectTracker: (id) => set({ activeTrackerId: id }),
  selectMocap: (id) => set({ activeMocapId: id }),

  tickTime: (deltaSeconds) => {
    const nextTime = get().timeSeconds + deltaSeconds;
    set({ timeSeconds: nextTime });

    // Solve Rig and Dolly movements dynamically
    const studio = get().studio;
    if (studio) {
      const updatedCameras = { ...studio.cameras };
      for (const [id, cam] of Object.entries(studio.cameras)) {
        // If camera is connected to a dolly/crane, compute constraints
        if (cam.type !== 'perspective' && cam.type !== 'orthographic') {
          const solvedTransform = globalVirtualStudioEngine.cameraService.solveRigConstraints(
            cam.type as any,
            cam.transform,
            { trackLength: 5.0, armLength: 3.0 },
            nextTime
          );
          updatedCameras[id] = {
            ...cam,
            transform: solvedTransform,
          };
        }
      }

      set({
        studio: {
          ...studio,
          cameras: updatedCameras,
        },
      });
    }
  },

  addCamera: (camera) => set((state) => {
    if (!state.studio) return {};
    const updatedStudio = {
      ...state.studio,
      cameras: {
        ...state.studio.cameras,
        [camera.id]: camera,
      },
    };
    globalVirtualStudioEngine.publish('CameraUpdated', camera);
    return { studio: updatedStudio, selectedCameraId: camera.id };
  }),

  removeCamera: (id) => set((state) => {
    if (!state.studio) return {};
    const updatedCameras = { ...state.studio.cameras };
    delete updatedCameras[id];
    return {
      studio: {
        ...state.studio,
        cameras: updatedCameras,
      },
      selectedCameraId: state.selectedCameraId === id ? null : state.selectedCameraId,
    };
  }),

  addLight: (light) => set((state) => {
    if (!state.studio) return {};
    const updatedStudio = {
      ...state.studio,
      lightRigs: {
        ...state.studio.lightRigs,
        [light.id]: light,
      },
    };
    globalVirtualStudioEngine.publish('LightingUpdated', light);
    return { studio: updatedStudio, selectedLightId: light.id };
  }),

  updateLight: (id, updates) => set((state) => {
    if (!state.studio || !state.studio.lightRigs[id]) return {};
    const updatedLight = {
      ...state.studio.lightRigs[id],
      ...updates,
    };
    const updatedStudio = {
      ...state.studio,
      lightRigs: {
        ...state.studio.lightRigs,
        [id]: updatedLight,
      },
    };
    globalVirtualStudioEngine.publish('LightingUpdated', updatedLight);
    return { studio: updatedStudio };
  }),

  updateEnvironment: (updates) => set((state) => {
    if (!state.studio) return {};
    const activeEnvId = Object.keys(state.studio.environments)[0];
    if (!activeEnvId) return {};

    const updatedEnv = {
      ...state.studio.environments[activeEnvId],
      ...updates,
    };
    const updatedStudio = {
      ...state.studio,
      environments: {
        ...state.studio.environments,
        [activeEnvId]: updatedEnv,
      },
    };
    globalVirtualStudioEngine.publish('EnvironmentChanged', updatedEnv);
    return { studio: updatedStudio };
  }),

  addTracker: (tracker) => set((state) => {
    if (!state.studio) return {};
    const updatedStudio = {
      ...state.studio,
      trackingSources: {
        ...state.studio.trackingSources,
        [tracker.id]: tracker,
      },
    };
    globalVirtualStudioEngine.publish('TrackingUpdated', tracker);
    return { studio: updatedStudio, activeTrackerId: tracker.id };
  }),
}));
