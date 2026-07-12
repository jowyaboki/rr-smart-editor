import { create } from 'zustand';
import { Scene, SceneGroup, Storyboard } from '@ai-video-editor/shared';

interface SceneState {
  storyboard: Storyboard | null;
  selectedSceneId: string | null;

  setStoryboard: (storyboard: Storyboard) => void;
  addScene: (scene: Scene) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  reorderScenes: (sceneIds: string[]) => void;

  setSelectedSceneId: (id: string | null) => void;

  addSceneGroup: (group: SceneGroup) => void;
  updateSceneGroup: (id: string, updates: Partial<SceneGroup>) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  storyboard: null,
  selectedSceneId: null,

  setStoryboard: (storyboard) => set({ storyboard }),

  addScene: (scene) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      scenes: [...state.storyboard.scenes, scene]
    } : null
  })),

  updateScene: (id, updates) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      scenes: state.storyboard.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    } : null
  })),

  removeScene: (id) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      scenes: state.storyboard.scenes.filter(s => s.id !== id)
    } : null,
    selectedSceneId: state.selectedSceneId === id ? null : state.selectedSceneId
  })),

  reorderScenes: (sceneIds) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      scenes: sceneIds.map(id => state.storyboard!.scenes.find(s => s.id === id)!)
    } : null
  })),

  setSelectedSceneId: (id) => set({ selectedSceneId: id }),

  addSceneGroup: (group) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      groups: [...state.storyboard.groups, group]
    } : null
  })),

  updateSceneGroup: (id, updates) => set((state) => ({
    storyboard: state.storyboard ? {
      ...state.storyboard,
      groups: state.storyboard.groups.map(g => g.id === id ? { ...g, ...updates } : g)
    } : null
  })),
}));
