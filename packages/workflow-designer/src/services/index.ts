import { WorkflowDefinition, WorkflowNode, WorkflowEdge, ExecutionStep, DebuggerBreakpoint, NodeLog } from '../types';

// ==========================================
// 1. NODE REGISTRY
// ==========================================
export class NodeRegistry {
  private registeredNodes = new Map<string, { type: string; category: string; label: string; configSchema?: any }>();

  public registerNodeType(type: string, category: string, label: string, configSchema?: any): void {
    this.registeredNodes.set(type, { type, category, label, configSchema });
  }

  public getNodeTypeInfo(type: string) {
    return this.registeredNodes.get(type);
  }

  public listRegisteredNodeTypes() {
    return Array.from(this.registeredNodes.values());
  }
}

// ==========================================
// 2. VALIDATION SERVICE
// ==========================================
export class ValidationService {
  /**
   * Validates a workflow layout, checking for cycles (DFS loop checks) and loose dangling edges
   */
  public validateWorkflow(wf: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check circular paths using topological loop detections
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const children = wf.edges.filter(e => e.sourceNodeId === nodeId).map(e => e.targetNodeId);
      for (const childId of children) {
        if (hasCycle(childId)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of wf.nodes) {
      if (hasCycle(node.id)) {
        errors.push(`CIRCULAR_WORKFLOW_DETECTED: Loop found in pipeline execution path.`);
        break;
      }
    }

    // Check dangling edges
    for (const edge of wf.edges) {
      const sourceExists = wf.nodes.some(n => n.id === edge.sourceNodeId);
      const targetExists = wf.nodes.some(n => n.id === edge.targetNodeId);
      if (!sourceExists || !targetExists) {
        errors.push(`DANGLING_EDGE: Edge ${edge.id} refers to unregistered nodes.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ==========================================
// 3. DEBUGGER SERVICE
// ==========================================
export class DebuggerService {
  private breakpoints = new Set<string>();
  private activeStepIndex = 0;
  private logs: NodeLog[] = [];

  public toggleBreakpoint(nodeId: string, enabled: boolean): void {
    if (enabled) {
      this.breakpoints.add(nodeId);
    } else {
      this.breakpoints.delete(nodeId);
    }
  }

  public hasBreakpoint(nodeId: string): boolean {
    return this.breakpoints.has(nodeId);
  }

  public logNodeEvent(nodeId: string, level: NodeLog['level'], message: string): void {
    this.logs.push({
      nodeId,
      timestamp: Date.now(),
      level,
      message,
    });
  }

  public getLogsForNode(nodeId: string): NodeLog[] {
    return this.logs.filter(l => l.nodeId === nodeId);
  }

  public getStepIndex(): number {
    return this.activeStepIndex;
  }

  public incrementStep(): void {
    this.activeStepIndex += 1;
  }

  public resetDebugger(): void {
    this.activeStepIndex = 0;
    this.logs = [];
  }
}

// ==========================================
// 4. MONITORING SERVICE
// ==========================================
export class MonitoringService {
  private metrics = new Map<string, { durationMs: number; memoryBytes: number; retriesCount: number }>();

  public recordMetrics(nodeId: string, durationMs: number, memoryBytes: number, retriesCount = 0): void {
    this.metrics.set(nodeId, { durationMs, memoryBytes, retriesCount });
  }

  public getMetrics(nodeId: string) {
    return this.metrics.get(nodeId);
  }

  public listAllMetrics() {
    return Array.from(this.metrics.entries());
  }
}

// ==========================================
// 5. EXECUTION BRIDGE
// ==========================================
export class ExecutionBridge {
  /**
   * Simulates/compiles visual definitions into execution JSON rules for the core Workflow Engine.
   */
  public compileToWorkflowEngineDefinition(wf: WorkflowDefinition): string {
    // Structural layout to flat sequential logic conversions
    return JSON.stringify({
      workflowId: wf.id,
      name: wf.name,
      tasks: wf.nodes.map(n => ({
        id: n.id,
        taskName: n.name,
        action: n.type,
        parameters: n.config,
      })),
      dependencies: wf.edges.map(e => ({
        from: e.sourceNodeId,
        to: e.targetNodeId,
      })),
    });
  }
}

// ==========================================
// 6. MASTER WORKFLOW DESIGNER SERVICE
// ==========================================
export class WorkflowDesigner {
  public readonly registry = new NodeRegistry();
  public readonly validation = new ValidationService();
  public readonly debug = new DebuggerService();
  public readonly monitoring = new MonitoringService();
  public readonly bridge = new ExecutionBridge();

  constructor() {
    this.registerBuiltInNodeCategories();
  }

  private registerBuiltInNodeCategories(): void {
    // Triggers
    this.registry.registerNodeType('manual', 'trigger', 'Manual Trigger');
    this.registry.registerNodeType('webhook', 'trigger', 'Webhook Trigger');
    this.registry.registerNodeType('render_completed', 'trigger', 'Render Completed');

    // AI
    this.registry.registerNodeType('prompt', 'ai', 'Prompt Node');
    this.registry.registerNodeType('storyboard', 'ai', 'Storyboard Node');
    this.registry.registerNodeType('voice_gen', 'ai', 'Voice Generator');

    // Media
    this.registry.registerNodeType('proxy_gen', 'media', 'Generate Proxy');
    this.registry.registerNodeType('thumbnail_gen', 'media', 'Generate Thumbnail');
    this.registry.registerNodeType('render_export', 'media', 'Render & Export');

    // Project
    this.registry.registerNodeType('create_project', 'project', 'Create Project');
    this.registry.registerNodeType('modify_timeline', 'project', 'Modify Timeline');

    // Logic
    this.registry.registerNodeType('if_cond', 'logic', 'If Condition');
    this.registry.registerNodeType('loop_node', 'logic', 'Loop Node');
  }
}
