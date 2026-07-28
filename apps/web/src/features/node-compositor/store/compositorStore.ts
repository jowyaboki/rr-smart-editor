import { create } from 'zustand';
import {
  NodeGraph,
  Node,
  NodeConnection,
  NodeGroup,
  NodePort,
  ExecutionContext,
  NodeCompositingEngine,
} from '@ai-video-editor/node-compositor';

const engine = new NodeCompositingEngine();
const templateLoader = engine.createTemplateLoader();
const execEngine = engine.createExecutionEngine();
const optimizer = engine.createOptimizer();

// Instantiate with green screen chroma key template
const initialGraph = templateLoader.loadChromaKeyTemplate('g_web_1');

interface CompositorState {
  graph: NodeGraph;
  selectedNodeId: string | null;
  selectedPortId: string | null;
  isExecuting: boolean;
  executionHistory: any[];
  heatmap: Record<string, 'cold' | 'warm' | 'hot'>;
  splitRatio: number;
  viewMode: 'preview' | 'split' | 'diff' | 'heatmap';

  // Actions
  initCompositorStore: () => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  connectPorts: (
    fromNodeId: string,
    fromPortId: string,
    toNodeId: string,
    toPortId: string,
  ) => void;
  disconnectConnection: (connectionId: string) => void;
  runExecution: () => Promise<void>;
  optimizeGraph: () => void;
  setViewMode: (mode: 'preview' | 'split' | 'diff' | 'heatmap') => void;
  setSplitRatio: (ratio: number) => void;
  updateNodeProperties: (nodeId: string, props: Record<string, any>) => void;
}

export const useCompositorStore = create<CompositorState>((set, get) => {
  return {
    graph: initialGraph,
    selectedNodeId: null,
    selectedPortId: null,
    isExecuting: false,
    executionHistory: [],
    heatmap: {},
    splitRatio: 0.5,
    viewMode: 'preview',

    initCompositorStore: () => {
      set({
        graph: JSON.parse(JSON.stringify(initialGraph)),
        selectedNodeId: null,
        selectedPortId: null,
        isExecuting: false,
        heatmap: {},
      });
      get().runExecution();
    },

    selectNode: (nodeId) => {
      set({ selectedNodeId: nodeId });
    },

    addNode: (node) => {
      const { graph } = get();
      graph.nodes.push(node);
      set({ graph: { ...graph, nodes: [...graph.nodes] } });
      get().runExecution();
    },

    removeNode: (id) => {
      const { graph } = get();
      graph.nodes = graph.nodes.filter((n) => n.id !== id);
      graph.connections = graph.connections.filter((c) => c.fromNodeId !== id && c.toNodeId !== id);
      set({
        graph: { ...graph, nodes: [...graph.nodes], connections: [...graph.connections] },
        selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      });
      get().runExecution();
    },

    connectPorts: (fromNodeId, fromPortId, toNodeId, toPortId) => {
      const { graph } = get();
      // Remove any duplicate connection pointing to same input port
      graph.connections = graph.connections.filter(
        (c) => !(c.toNodeId === toNodeId && c.toPortId === toPortId),
      );

      const connection: NodeConnection = {
        id: `conn_${Date.now()}`,
        fromNodeId,
        fromPortId,
        toNodeId,
        toPortId,
      };

      graph.connections.push(connection);

      const target = graph.nodes.find((n) => n.id === toNodeId);
      if (target) target.isDirty = true;

      set({ graph: { ...graph, connections: [...graph.connections] } });
      get().runExecution();
    },

    disconnectConnection: (connectionId) => {
      const { graph } = get();
      const conn = graph.connections.find((c) => c.id === connectionId);
      if (conn) {
        const target = graph.nodes.find((n) => n.id === conn.toNodeId);
        if (target) target.isDirty = true;
      }
      graph.connections = graph.connections.filter((c) => c.id !== connectionId);
      set({ graph: { ...graph, connections: [...graph.connections] } });
      get().runExecution();
    },

    runExecution: async () => {
      const { graph } = get();
      set({ isExecuting: true });

      const ctx: ExecutionContext = {
        currentTime: 0,
        fps: 30,
        width: 1920,
        height: 1080,
        cache: execEngine.getCache(),
        variables: {},
      };

      try {
        const report = await execEngine.executeGraph(graph, ctx);

        // Generate simulated latencies for heatmap visualization
        const heatmapMock: Record<string, 'cold' | 'warm' | 'hot'> = {};
        graph.nodes.forEach((n) => {
          if (n.type === 'chroma_key') {
            heatmapMock[n.id] = 'hot';
          } else if (n.category === 'blur' || n.category === 'merge') {
            heatmapMock[n.id] = 'warm';
          } else {
            heatmapMock[n.id] = 'cold';
          }
        });

        set((state) => ({
          executionHistory: [report, ...state.executionHistory],
          heatmap: heatmapMock,
          graph: { ...graph }, // Sync layout values
        }));
      } catch (err) {
        console.error('Execution run error:', err);
      } finally {
        set({ isExecuting: false });
      }
    },

    optimizeGraph: () => {
      const { graph } = get();
      const cloned = JSON.parse(JSON.stringify(graph));

      optimizer.foldConstants(cloned);
      optimizer.fuseConsecutiveTransforms(cloned);
      optimizer.eliminateDeadNodes(cloned);

      set({ graph: cloned });
      get().runExecution();
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
    },

    setSplitRatio: (ratio) => {
      set({ splitRatio: ratio });
    },

    updateNodeProperties: (nodeId, props) => {
      const { graph } = get();
      const node = graph.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.properties = { ...node.properties, ...props };
        node.isDirty = true;
        set({ graph: { ...graph, nodes: [...graph.nodes] } });
        get().runExecution();
      }
    },
  };
});
