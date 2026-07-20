import { EffectsEngine } from '@ai-video-editor/effects-engine';

export class WebEffectsService {
  private engine = new EffectsEngine();

  public getEngine(): EffectsEngine {
    return this.engine;
  }
}
export const effectsService = new WebEffectsService();
