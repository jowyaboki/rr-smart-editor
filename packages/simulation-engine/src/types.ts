import { Project, Workflow, WorkflowStep, WorkflowVariable } from '@ai-video-editor/shared';

// Core Types
export type SimulationType =
  | 'timeline_edit'
  | 'ai_operation'
  | 'workflow_execution'
  | 'rendering'
  | 'publishing'
  | 'asset_replacement'
  | 'plugin_execution'
  | 'variable_update'
  | 'expression_evaluation';

export interface SimulationEvent {
  id: string;
  timestamp: string;
  type: SimulationType;
  description: string;
  metadata?: Record<string, any>;
  stateDelta?: {
    before: any;
    after: any;
  };
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    type: SimulationType;
    payload: any;
  }>;
}

export interface CostEstimate {
  aiTokenCost: number;
  renderCost: number;
  storageCost: number;
  totalCost: number;
  currency: string;
}

export interface PerformanceEstimate {
  renderDurationMs: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  storageGrowthMb: number;
  networkTransferMb: number;
}

export interface Prediction {
  id: string;
  timestamp: string;
  performance: PerformanceEstimate;
  cost: CostEstimate;
  timelineComplexity: 'low' | 'medium' | 'high';
  confidenceScore: number; // 0 to 1
}

export interface OptimizationProposal {
  id: string;
  category: 'merge_layers' | 'optimize_assets' | 'reduce_effects' | 'cache_opportunities' | 'proxy_recommendations' | 'workflow_improvements';
  title: string;
  description: string;
  potentialSavings: {
    costReduction: number;
    renderDurationReductionMs: number;
    memoryReductionMb: number;
  };
  effort: 'low' | 'medium' | 'high';
  actionableTransaction?: any; // Rollback or forward Transaction representation
}

export interface ValidationIssue {
  id: string;
  category: 'broken_reference' | 'invalid_expression' | 'missing_asset' | 'circular_workflow' | 'plugin_conflict' | 'permission_failure';
  severity: 'warning' | 'error';
  message: string;
  targetId?: string; // id of clip, track, workflow step, etc.
}

export interface SimulationResult {
  simulationId: string;
  scenarioId?: string;
  success: boolean;
  predictions: Prediction;
  optimizationProposals: OptimizationProposal[];
  validationIssues: ValidationIssue[];
  events: SimulationEvent[];
  finalProjectState: Project;
  transactions: any[]; // Transactions generated for user approval
}

export interface Simulation {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scenario?: Scenario;
  result?: SimulationResult;
  createdAt: string;
}

export interface SimulationAdapter {
  id: string;
  name: string;
  supportedTypes: SimulationType[];
  execute: (twin: IDigitalTwin, type: SimulationType, payload: any) => Promise<SimulationEvent>;
}

export interface PredictionProvider {
  id: string;
  name: string;
  estimate: (twin: IDigitalTwin) => Promise<{
    performance: Partial<PerformanceEstimate>;
    cost: Partial<CostEstimate>;
  }>;
}

export interface Validator {
  id: string;
  name: string;
  validate: (twin: IDigitalTwin) => Promise<ValidationIssue[]>;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  analyze: (twin: IDigitalTwin) => Promise<OptimizationProposal[]>;
}

export interface IDigitalTwin {
  id: string;
  originalProjectId: string;
  state: {
    project: Project;
    workflows: Workflow[];
    variables: WorkflowVariable[];
    assets: any[];
    plugins: string[];
    permissions: string[];
  };
  history: SimulationEvent[];
  replayPointer: number; // For step-by-step and time travel

  // Operations
  executeOperation: (type: SimulationType, payload: any) => Promise<SimulationEvent>;
  getProjectState: () => Project;
  getWorkflows: () => Workflow[];
  getVariables: () => WorkflowVariable[];
  getAssets: () => any[];
  getPlugins: () => string[];
  getPermissions: () => string[];

  // Replay
  replayToStep: (stepIndex: number) => void;
  rollbackStep: () => SimulationEvent | null;
  clone: () => IDigitalTwin;
}
