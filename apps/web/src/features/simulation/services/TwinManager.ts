import { SimulationEngine, IDigitalTwin } from '@ai-video-editor/simulation-engine';
import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';

export class TwinManager {
  private engine: SimulationEngine;
  private twins: Map<string, IDigitalTwin> = new Map();

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  public createTwin(
    project: Project,
    workflows: Workflow[] = [],
    variables: WorkflowVariable[] = [],
    assets: any[] = [],
    plugins: string[] = [],
    permissions: string[] = []
  ): IDigitalTwin {
    const twin = this.engine.createTwin(project, workflows, variables, assets, plugins, permissions);
    this.twins.set(twin.id, twin);
    return twin;
  }

  public getTwin(id: string): IDigitalTwin | undefined {
    return this.twins.get(id);
  }

  public removeTwin(id: string): boolean {
    return this.twins.delete(id);
  }

  public listTwins(): IDigitalTwin[] {
    return Array.from(this.twins.values());
  }
}
