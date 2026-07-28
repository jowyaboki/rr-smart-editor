import { create } from 'zustand';
import {
  Composition,
  CompositionLayer,
  RiggingConstraint,
  MotionGraphicsComposerEngine,
} from '@ai-video-editor/motion-composer';

const localComposerEngine = new MotionGraphicsComposerEngine();

const initialComp: Composition = {
  id: 'comp_web_1',
  name: 'Motion Intro Logo Reveal',
  width: 1920,
  height: 1080,
  fps: 30,
  durationFrames: 150,
  layers: [
    {
      id: 'layer_logo_reveal',
      name: 'Primary Brand Logo Layer',
      type: 'media',
      transform: {
        position: [960, 540, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [60, 60],
        opacity: 1,
      },
      startFrame: 0,
      duration: 150,
      isLocked: false,
      isShy: false,
    },
    {
      id: 'layer_arrow_tracker',
      name: 'Look-At Arrow Tracker Icon',
      type: 'shape',
      transform: {
        position: [400, 300, 0],
        rotation: [0, 0, 0],
        scale: [1.5, 1.5, 1.5],
        anchorPoint: [0, 0],
        opacity: 0.8,
      },
      startFrame: 0,
      duration: 150,
      isLocked: false,
      isShy: false,
    },
  ],
  constraints: [
    {
      id: 'const_web_1',
      type: 'look_at',
      sourceLayerId: 'layer_arrow_tracker',
      targetId: 'layer_logo_reveal',
      weight: 1.0,
    },
  ],
  markers: [],
  version: '1.0.0',
};

interface MotionComposerState {
  activeComp: Composition | null;
  selectedLayerId: string | null;
  currentTime: number;
  isPlaying: boolean;
  activeCameraId: string | null;

  // Actions
  initComposerStore: () => void;
  selectLayer: (id: string | null) => void;
  setFrame: (frame: number) => void;
  addLayer: (layer: CompositionLayer) => void;
  removeLayer: (id: string) => void;
  addConstraint: (constraint: RiggingConstraint) => void;
  evaluateRigConstraints: () => void;
}

export const useMotionComposerStore = create<MotionComposerState>((set, get) => {
  return {
    activeComp: null,
    selectedLayerId: null,
    currentTime: 0,
    isPlaying: false,
    activeCameraId: null,

    initComposerStore: () => {
      localComposerEngine.composerService.createComposition(initialComp.id, initialComp.name);
      initialComp.layers.forEach((l) =>
        localComposerEngine.composerService.addLayer(initialComp.id, l),
      );

      const comp = localComposerEngine.composerService.getComposition(initialComp.id)!;
      comp.constraints = [...initialComp.constraints];

      set({
        activeComp: comp,
        selectedLayerId: null,
        currentTime: 0,
        isPlaying: false,
      });

      get().evaluateRigConstraints();
    },

    selectLayer: (id) => {
      set({ selectedLayerId: id });
    },

    setFrame: (frame) => {
      set({ currentTime: frame });
      get().evaluateRigConstraints();
    },

    addLayer: (layer) => {
      const { activeComp } = get();
      if (!activeComp) return;

      localComposerEngine.composerService.addLayer(activeComp.id, layer);
      set({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
      get().evaluateRigConstraints();
    },

    removeLayer: (id) => {
      const { activeComp } = get();
      if (!activeComp) return;

      localComposerEngine.composerService.removeLayer(activeComp.id, id);
      set({
        activeComp: { ...activeComp, layers: [...activeComp.layers] },
        selectedLayerId: get().selectedLayerId === id ? null : get().selectedLayerId,
      });
      get().evaluateRigConstraints();
    },

    addConstraint: (constraint) => {
      const { activeComp } = get();
      if (!activeComp) return;

      activeComp.constraints.push(constraint);
      set({ activeComp: { ...activeComp, constraints: [...activeComp.constraints] } });
      get().evaluateRigConstraints();
    },

    evaluateRigConstraints: () => {
      const { activeComp } = get();
      if (!activeComp) return;

      activeComp.layers.forEach((layer) => {
        localComposerEngine.rigService.resolveConstraints(
          layer,
          activeComp.constraints,
          activeComp.layers,
        );
      });

      set({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
    },
  };
});
