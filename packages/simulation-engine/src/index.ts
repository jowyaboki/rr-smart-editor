import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';
import { DigitalTwin } from './DigitalTwin';
import { PredictionService } from './services/PredictionService';
import { OptimizationService } from './services/OptimizationService';
import { ValidationService } from './services/ValidationService';
import {
  IDigitalTwin,
  Simulation,
  SimulationResult,
  Scenario,
  SimulationEvent,
  PredictionProvider,
  Validator,
  OptimizationStrategy,
  SimulationAdapter,
  SimulationType,
} from './types';

export * from './types';
export * from './DigitalTwin';
export * from './services/PredictionService';
export * from './services/OptimizationService';
export * from './services/ValidationService';

export class SimulationEngine {
  public predictionService: PredictionService;
  public optimizationService: OptimizationService;
  public validationService: ValidationService;
  private adapters: SimulationAdapter[] = [];

  constructor() {
    this.predictionService = new PredictionService();
    this.optimizationService = new OptimizationService();
    this.validationService = new ValidationService();
  }

  public registerAdapter(adapter: SimulationAdapter): void {
    this.adapters.push(adapter);
  }

  public createTwin(
    project: Project,
    workflows: Workflow[] = [],
    variables: WorkflowVariable[] = [],
    assets: any[] = [],
    plugins: string[] = [],
    permissions: string[] = []
  ): IDigitalTwin {
    return new DigitalTwin(
      `twin_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      project,
      workflows,
      variables,
      assets,
      plugins,
      permissions
    );
  }

  /**
   * Runs a complete simulation scenario against a digital twin, and yields the final reports
   */
  public async runSimulation(twin: IDigitalTwin, scenario?: Scenario): Promise<SimulationResult> {
    const simulationId = `sim_${Date.now()}`;
    const cloneTwin = twin.clone(); // Run against cloned state to protect twin state if needed, or run directly

    // Execute scenario steps if provided
    if (scenario && scenario.steps) {
      for (const step of scenario.steps) {
        // Run adapter if registered, otherwise default
        const adapter = this.adapters.find(a => a.supportedTypes.includes(step.type));
        if (adapter) {
          await adapter.execute(cloneTwin, step.type, step.payload);
        } else {
          await cloneTwin.executeOperation(step.type, step.payload);
        }
      }
    }

    // Evaluate estimates, optimizations, and validations
    const predictions = await this.predictionService.estimate(cloneTwin);
    const optimizationProposals = await this.optimizationService.analyze(cloneTwin);
    const validationIssues = await this.validationService.validate(cloneTwin);

    // Generate Transactions that can apply these changes to the real project
    const transactions = this.generateTransactions(cloneTwin.history);

    const success = validationIssues.filter(i => i.severity === 'error').length === 0;

    return {
      simulationId,
      scenarioId: scenario?.id,
      success,
      predictions,
      optimizationProposals,
      validationIssues,
      events: [...cloneTwin.history],
      finalProjectState: cloneTwin.getProjectState(),
      transactions,
    };
  }

  /**
   * Helper to convert simulation history into Transactions for user approval
   */
  private generateTransactions(events: SimulationEvent[]): any[] {
    const transactions: any[] = [];
    events.forEach(event => {
      if (event.type === 'timeline_edit') {
        const payload = event.metadata;
        if (payload?.action === 'move') {
          transactions.push({
            id: `tx_${Math.random().toString(36).substr(2, 9)}`,
            type: 'move_clip',
            payload: {
              clipId: payload.clipId,
              startFrame: payload.startFrame,
              trackId: payload.trackId,
            },
          });
        } else if (payload?.action === 'resize') {
          transactions.push({
            id: `tx_${Math.random().toString(36).substr(2, 9)}`,
            type: 'resize_clip',
            payload: {
              clipId: payload.clipId,
              duration: payload.duration,
            },
          });
        } else if (payload?.action === 'add') {
          transactions.push({
            id: `tx_${Math.random().toString(36).substr(2, 9)}`,
            type: 'add_clip',
            payload: payload.clip,
          });
        }
      } else if (event.type === 'variable_update') {
        transactions.push({
          id: `tx_${Math.random().toString(36).substr(2, 9)}`,
          type: 'update_variable',
          payload: {
            name: event.metadata?.name,
            value: event.metadata?.value,
          },
        });
      } else if (event.type === 'asset_replacement') {
        transactions.push({
          id: `tx_${Math.random().toString(36).substr(2, 9)}`,
          type: 'replace_asset',
          payload: {
            oldAssetId: event.metadata?.oldAssetId,
            newAssetId: event.metadata?.newAssetId,
          },
        });
      }
    });
    return transactions;
  }
}
