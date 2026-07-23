import { SimulationEngine, IDigitalTwin, ValidationIssue } from '@ai-video-editor/simulation-engine';

export class ValidationService {
  private engine: SimulationEngine;

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public async validate(twin: IDigitalTwin): Promise<ValidationIssue[]> {
    return this.engine.validationService.validate(twin);
  }
}
