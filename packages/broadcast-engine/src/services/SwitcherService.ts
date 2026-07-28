import { SwitcherState, LiveScene, LiveTransition, TransitionType } from '../types';

export class SwitcherService {
  private state: SwitcherState = {
    previewSceneId: null,
    programSceneId: null,
    activeTransition: null,
    isTransitioning: false,
    transitionProgress: 0.0,
  };

  private scenes: LiveScene[] = [];

  constructor(initialScenes: LiveScene[] = []) {
    this.scenes = initialScenes;
    if (initialScenes.length > 0) {
      this.state.previewSceneId = initialScenes[0].id;
      this.state.programSceneId = initialScenes[0].id;
    }
  }

  public getSwitcherState(): SwitcherState {
    return this.state;
  }

  public setScenes(scenes: LiveScene[]): void {
    this.scenes = scenes;
  }

  public selectPreview(sceneId: string): void {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error(`Scene with ID ${sceneId} does not exist.`);
    this.state.previewSceneId = sceneId;
  }

  public selectProgramDirectly(sceneId: string): void {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error(`Scene with ID ${sceneId} does not exist.`);
    this.state.programSceneId = sceneId;
  }

  public async performTransition(transition: LiveTransition): Promise<void> {
    if (this.state.isTransitioning) {
      throw new Error('A scene transition is already in progress.');
    }
    if (!this.state.previewSceneId) {
      throw new Error('No preview scene selected to transition to.');
    }

    this.state.isTransitioning = true;
    this.state.activeTransition = transition;
    this.state.transitionProgress = 0.0;

    const steps = 10;
    const intervalMs = transition.durationMs / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      this.state.transitionProgress = i / steps;
    }

    // Complete the transition
    this.state.programSceneId = this.state.previewSceneId;
    this.state.isTransitioning = false;
    this.state.activeTransition = null;
    this.state.transitionProgress = 1.0;
  }

  public async cut(): Promise<void> {
    const directTransition: LiveTransition = {
      id: 'transition_cut_instant',
      type: 'cut',
      durationMs: 0,
    };
    await this.performTransition(directTransition);
  }

  public async fade(durationMs: number = 500): Promise<void> {
    const transition: LiveTransition = {
      id: `transition_fade_${Date.now()}`,
      type: 'fade',
      durationMs,
    };
    await this.performTransition(transition);
  }

  public async wipe(durationMs: number = 800): Promise<void> {
    const transition: LiveTransition = {
      id: `transition_wipe_${Date.now()}`,
      type: 'wipe',
      durationMs,
    };
    await this.performTransition(transition);
  }

  public async stinger(stingerAssetId: string, durationMs: number = 1000): Promise<void> {
    const transition: LiveTransition = {
      id: `transition_stinger_${Date.now()}`,
      type: 'stinger',
      durationMs,
      stingerVideoAssetId: stingerAssetId,
    };
    await this.performTransition(transition);
  }
}
