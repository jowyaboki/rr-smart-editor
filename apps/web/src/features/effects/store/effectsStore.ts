import { create } from 'zustand';
import { CompositingLayer, Effect, EffectChain, EffectPreset } from '../types';
import { EffectFactory } from '../effects';

export interface EffectsState {
  layers: CompositingLayer[];
  selectedLayerId: string | null;
  presets: EffectPreset[];
  history: Array<{ layers: CompositingLayer[] }>;
  historyIndex: number;

  // Actions
  setLayers: (layers: CompositingLayer[]) => void;
  selectLayer: (id: string | null) => void;
  addLayer: (layer: CompositingLayer) => void;
  removeLayer: (id: string) => void;
  updateLayerTransform: (id: string, transform: Partial<CompositingLayer['transform']>) => void;
  updateLayerBlendMode: (id: string, blendMode: CompositingLayer['blendMode']) => void;
  updateLayerOpacity: (id: string, opacity: number) => void;

  // Mask actions
  addMaskToLayer: (layerId: string, mask: any) => void;
  removeMaskFromLayer: (layerId: string, maskId: string) => void;
  updateMaskInLayer: (layerId: string, maskId: string, updates: any) => void;

  // Effect actions
  addEffectToLayer: (layerId: string, type: string) => void;
  removeEffectFromLayer: (layerId: string, effectId: string) => void;
  updateEffectParameter: (layerId: string, effectId: string, paramKey: string, value: any) => void;
  toggleEffectEnabled: (layerId: string, effectId: string) => void;

  // Preset actions
  savePreset: (preset: EffectPreset) => void;
  applyPresetToEffect: (layerId: string, effectId: string, presetId: string) => void;

  // History actions
  undo: () => void;
  redo: () => void;
}

export const useEffectsStore = create<EffectsState>((set, get) => {
  const pushToHistory = (newLayers: CompositingLayer[]) => {
    const { history, historyIndex } = get();
    const truncatedHistory = history.slice(0, historyIndex + 1);
    set({
      history: [...truncatedHistory, { layers: JSON.parse(JSON.stringify(newLayers)) }],
      historyIndex: truncatedHistory.length,
    });
  };

  return {
    layers: [],
    selectedLayerId: null,
    presets: [],
    history: [],
    historyIndex: -1,

    setLayers: (layers) => {
      set({ layers, selectedLayerId: layers[0]?.id || null });
      pushToHistory(layers);
    },

    selectLayer: (id) => set({ selectedLayerId: id }),

    addLayer: (layer) => {
      const { layers } = get();
      const updated = [...layers, layer];
      set({ layers: updated, selectedLayerId: layer.id });
      pushToHistory(updated);
    },

    removeLayer: (id) => {
      const { layers, selectedLayerId } = get();
      const updated = layers.filter((l) => l.id !== id);
      set({
        layers: updated,
        selectedLayerId: selectedLayerId === id ? updated[0]?.id || null : selectedLayerId,
      });
      pushToHistory(updated);
    },

    updateLayerTransform: (id, transform) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === id ? { ...l, transform: { ...l.transform, ...transform } } : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    updateLayerBlendMode: (id, blendMode) => {
      const { layers } = get();
      const updated = layers.map((l) => (l.id === id ? { ...l, blendMode } : l));
      set({ layers: updated });
      pushToHistory(updated);
    },

    updateLayerOpacity: (id, opacity) => {
      const { layers } = get();
      const updated = layers.map((l) => (l.id === id ? { ...l, opacity } : l));
      set({ layers: updated });
      pushToHistory(updated);
    },

    addMaskToLayer: (layerId, mask) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, masks: [...l.masks, mask] } : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    removeMaskFromLayer: (layerId, maskId) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId ? { ...l, masks: l.masks.filter((m) => m.id !== maskId) } : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    updateMaskInLayer: (layerId, maskId, updates) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              masks: l.masks.map((m) => (m.id === maskId ? { ...m, ...updates } : m)),
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    addEffectToLayer: (layerId, type) => {
      const { layers } = get();
      let effect: Effect;
      switch (type) {
        case 'blur':
          effect = EffectFactory.createBlur();
          break;
        case 'gaussian_blur':
          effect = EffectFactory.createGaussianBlur();
          break;
        case 'glow':
          effect = EffectFactory.createGlow();
          break;
        case 'shadow':
          effect = EffectFactory.createShadow();
          break;
        case 'brightness':
          effect = EffectFactory.createBrightness();
          break;
        case 'contrast':
          effect = EffectFactory.createContrast();
          break;
        case 'exposure':
          effect = EffectFactory.createExposure();
          break;
        case 'saturation':
          effect = EffectFactory.createSaturation();
          break;
        case 'hue':
          effect = EffectFactory.createHue();
          break;
        case 'tint':
          effect = EffectFactory.createTint();
          break;
        case 'curves':
          effect = EffectFactory.createCurves();
          break;
        case 'levels':
          effect = EffectFactory.createLevels();
          break;
        case 'color_balance':
          effect = EffectFactory.createColorBalance();
          break;
        case 'sharpen':
          effect = EffectFactory.createSharpen();
          break;
        case 'noise':
          effect = EffectFactory.createNoise();
          break;
        case 'grain':
          effect = EffectFactory.createGrain();
          break;
        case 'vignette':
          effect = EffectFactory.createVignette();
          break;
        case 'chromatic_aberration':
          effect = EffectFactory.createChromaticAberration();
          break;
        case 'pixelate':
          effect = EffectFactory.createPixelate();
          break;
        case 'posterize':
          effect = EffectFactory.createPosterize();
          break;
        case 'emboss':
          effect = EffectFactory.createEmboss();
          break;
        case 'edge_detect':
          effect = EffectFactory.createEdgeDetect();
          break;
        default:
          throw new Error(`Unsupported effect type: ${type}`);
      }

      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              effects: { ...l.effects, effects: [...l.effects.effects, effect] },
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    removeEffectFromLayer: (layerId, effectId) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              effects: {
                ...l.effects,
                effects: l.effects.effects.filter((e) => e.id !== effectId),
              },
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    updateEffectParameter: (layerId, effectId, paramKey, value) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              effects: {
                ...l.effects,
                effects: l.effects.effects.map((e) =>
                  e.id === effectId
                    ? {
                        ...e,
                        parameters: {
                          ...e.parameters,
                          [paramKey]: { ...e.parameters[paramKey], value },
                        },
                      }
                    : e
                ),
              },
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    toggleEffectEnabled: (layerId, effectId) => {
      const { layers } = get();
      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              effects: {
                ...l.effects,
                effects: l.effects.effects.map((e) =>
                  e.id === effectId ? { ...e, enabled: !e.enabled } : e
                ),
              },
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    savePreset: (preset) => {
      set((state) => ({ presets: [...state.presets, preset] }));
    },

    applyPresetToEffect: (layerId, effectId, presetId) => {
      const { layers, presets } = get();
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;

      const updated = layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              effects: {
                ...l.effects,
                effects: l.effects.effects.map((e) => {
                  if (e.id !== effectId) return e;
                  const updatedParams = { ...e.parameters };
                  for (const [k, v] of Object.entries(preset.parameters)) {
                    if (updatedParams[k]) {
                      updatedParams[k] = { ...updatedParams[k], value: v };
                    }
                  }
                  return { ...e, parameters: updatedParams };
                }),
              },
            }
          : l
      );
      set({ layers: updated });
      pushToHistory(updated);
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        set({
          layers: JSON.parse(JSON.stringify(history[prevIndex].layers)),
          historyIndex: prevIndex,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          layers: JSON.parse(JSON.stringify(history[nextIndex].layers)),
          historyIndex: nextIndex,
        });
      }
    },
  };
});
