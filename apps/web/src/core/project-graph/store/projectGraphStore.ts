import { create } from 'zustand';
import { ProjectGraph, GraphNode, GraphEdge, GraphSnapshot, GraphDiff, NodeType, DependencyType } from '../types';
import { webGraphEngine, DependencyResolver, InvalidationService, SnapshotService, GraphSerializer } from '../services';
import { GraphValidationRegistry, GraphValidationError } from '../validation';

interface ProjectGraphState {
  graph: ProjectGraph;
  selectedNodeId: string | null;
  snapshots: GraphSnapshot[];
  validationErrors: GraphValidationError[];
  hotPaths: Record<string, number>; // Maps nodeId -> write/update counts
  isExecuting: boolean;

  // Setters/Selections
  setSelectedNodeId: (id: string | null) => void;

  // Graph Structure actions
  insertNode: (node: GraphNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodeValue: (nodeId: string, newValue: any) => void;
  addEdge: (edge: GraphEdge) => void;
  removeEdge: (edgeId: string) => void;
  clearGraph: () => void;

  // Dependency evaluation & propagation
  propagateUpdates: (startNodeId: string) => string[];
  validateGraph: () => void;

  // Snapshot actions
  takeSnapshot: (description?: string) => GraphSnapshot;
  restoreSnapshot: (snapshotId: string) => void;
}

export const useProjectGraphStore = create<ProjectGraphState>((set, get) => {
  // Setup default starting nodes for demonstration/bootstrap
  const engineGraph = webGraphEngine.getGraph();

  return {
    graph: engineGraph,
    selectedNodeId: null,
    snapshots: [],
    validationErrors: [],
    hotPaths: {},
    isExecuting: false,

    setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),

    insertNode: (node: GraphNode) => {
      webGraphEngine.insertNode(node);
      get().validateGraph();
      set({ graph: { ...webGraphEngine.getGraph() } });
    },

    removeNode: (nodeId: string) => {
      webGraphEngine.removeNode(nodeId);

      const newHotPaths = { ...get().hotPaths };
      delete newHotPaths[nodeId];

      const newSelected = get().selectedNodeId === nodeId ? null : get().selectedNodeId;

      get().validateGraph();
      set({
        graph: { ...webGraphEngine.getGraph() },
        hotPaths: newHotPaths,
        selectedNodeId: newSelected,
      });
    },

    updateNodeValue: (nodeId: string, newValue: any) => {
      webGraphEngine.updateNodeValue(nodeId, newValue);

      // Record hot path metric
      const currentCount = get().hotPaths[nodeId] || 0;
      const newHotPaths = {
        ...get().hotPaths,
        [nodeId]: currentCount + 1,
      };

      set({ hotPaths: newHotPaths });

      // Run incremental validation
      get().validateGraph();
      set({ graph: { ...webGraphEngine.getGraph() } });
    },

    addEdge: (edge: GraphEdge) => {
      webGraphEngine.addEdge(edge);
      get().validateGraph();
      set({ graph: { ...webGraphEngine.getGraph() } });
    },

    removeEdge: (edgeId: string) => {
      webGraphEngine.removeEdge(edgeId);
      get().validateGraph();
      set({ graph: { ...webGraphEngine.getGraph() } });
    },

    clearGraph: () => {
      webGraphEngine.setGraph({
        id: 'web-master-graph',
        name: 'Smart Editor Main Graph',
        version: 1,
        nodes: {},
        edges: {},
      });
      set({
        graph: { ...webGraphEngine.getGraph() },
        selectedNodeId: null,
        hotPaths: {},
        validationErrors: [],
      });
    },

    propagateUpdates: (startNodeId: string) => {
      set({ isExecuting: true });
      try {
        const recomputed = InvalidationService.propagateUpdates(startNodeId, webGraphEngine.getGraph());
        set({ graph: { ...webGraphEngine.getGraph() } });
        return recomputed;
      } finally {
        set({ isExecuting: false });
      }
    },

    validateGraph: () => {
      const errors = GraphValidationRegistry.validate(webGraphEngine.getGraph());
      set({ validationErrors: errors });
    },

    takeSnapshot: (description?: string) => {
      const snap = SnapshotService.createSnapshot(webGraphEngine.getGraph(), description);
      set({ snapshots: [...SnapshotService.getSnapshots(webGraphEngine.getGraph().id)] });
      return snap;
    },

    restoreSnapshot: (snapshotId: string) => {
      const snaps = SnapshotService.getSnapshots(webGraphEngine.getGraph().id);
      const target = snaps.find(s => s.id === snapshotId);
      if (target) {
        const restored = SnapshotService.restoreSnapshot(target);
        webGraphEngine.setGraph(restored);
        set({
          graph: restored,
          selectedNodeId: null,
        });
        get().validateGraph();
      }
    },
  };
});
