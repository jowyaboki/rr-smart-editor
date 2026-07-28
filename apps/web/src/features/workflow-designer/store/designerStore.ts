import { create } from 'zustand';
import { WorkflowNode, WorkflowEdge, ExecutionStep } from '../types';

export interface DesignerState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionSteps: Record<string, ExecutionStep>;
  activeStepNodeId: string | null;
  breakpoints: string[]; // List of nodeId with breakpoints
  isDebugging: boolean;
  loading: boolean;

  // Actions
  setWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeConfig: (id: string, config: Record<string, any>) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (id: string) => void;

  // Debugger actions
  toggleBreakpoint: (nodeId: string) => void;
  setDebugging: (isDebugging: boolean) => void;
  setActiveStepNodeId: (nodeId: string | null) => void;
  updateExecutionStep: (nodeId: string, updates: Partial<ExecutionStep>) => void;
  clearDebuggerState: () => void;
}

export const useDesignerStore = create<DesignerState>((set) => ({
  nodes: [],
  edges: [],
  executionSteps: {},
  activeStepNodeId: null,
  breakpoints: [],
  isDebugging: false,
  loading: false,

  setWorkflow: (nodes, edges) => set({ nodes, edges }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.sourceNodeId !== id && e.targetNodeId !== id),
  })),

  updateNodePosition: (id, x, y) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, position: { x, y } } : n),
  })),

  updateNodeConfig: (id, config) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, config: { ...n.config, ...config } } : n),
  })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  removeEdge: (id) => set((state) => ({ edges: state.edges.filter(e => e.id !== id) })),

  toggleBreakpoint: (nodeId) => set((state) => ({
    breakpoints: state.breakpoints.includes(nodeId)
      ? state.breakpoints.filter(id => id !== nodeId)
      : [...state.breakpoints, nodeId],
  })),

  setDebugging: (isDebugging) => set({ isDebugging }),

  setActiveStepNodeId: (activeStepNodeId) => set({ activeStepNodeId }),

  updateExecutionStep: (nodeId, updates) => set((state) => {
    const existing = state.executionSteps[nodeId] || { nodeId, status: 'idle' };
    return {
      executionSteps: {
        ...state.executionSteps,
        [nodeId]: { ...existing, ...updates },
      },
    };
  }),

  clearDebuggerState: () => set({ executionSteps: {}, activeStepNodeId: null, isDebugging: false }),
}));
