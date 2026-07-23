import { SimulationEngine, IDigitalTwin, Scenario, SimulationResult } from '@ai-video-editor/simulation-engine';

export class SimulationService {
  private engine: SimulationEngine;

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public async run(twin: IDigitalTwin, scenario?: Scenario): Promise<SimulationResult> {
    return this.engine.runSimulation(twin, scenario);
  }
}
