import { SimulationEngine, IDigitalTwin, OptimizationProposal } from '@ai-video-editor/simulation-engine';

export class OptimizationService {
  private engine: SimulationEngine;

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public async analyze(twin: IDigitalTwin): Promise<OptimizationProposal[]> {
    return this.engine.optimizationService.analyze(twin);
  }
}
