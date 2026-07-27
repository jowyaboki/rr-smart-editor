export * from './types';
export * from './services/NodeGraphService';
export * from './services/ExecutionService';
export * from './services/OptimizationService';
export * from './services/PreviewService';
export * from './services/TemplateService';

import { NodeGraph } from './types';
import { NodeGraphService } from './services/NodeGraphService';
import { ExecutionService } from './services/ExecutionService';
import { OptimizationService } from './services/OptimizationService';
import { PreviewService } from './services/PreviewService';
import { TemplateService } from './services/TemplateService';

export class NodeCompositingEngine {
  public createGraphSession(graphId: string, name: string): NodeGraphService {
    return new NodeGraphService(graphId, name);
  }

  public createExecutionEngine(): ExecutionService {
    return new ExecutionService();
  }

  public createOptimizer(): OptimizationService {
    return new OptimizationService();
  }

  public createPreviewManager(): PreviewService {
    return new PreviewService();
  }

  public createTemplateLoader(): TemplateService {
    return new TemplateService();
  }
}
