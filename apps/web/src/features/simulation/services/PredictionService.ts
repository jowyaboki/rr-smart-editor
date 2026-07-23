import { SimulationEngine, IDigitalTwin, Prediction } from '@ai-video-editor/simulation-engine';

export class PredictionService {
  private engine: SimulationEngine;

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public async estimate(twin: IDigitalTwin): Promise<Prediction> {
    return this.engine.predictionService.estimate(twin);
  }
}
