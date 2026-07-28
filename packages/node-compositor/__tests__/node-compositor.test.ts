import { NodeCompositingEngine, NodeGraph, Node, ExecutionContext } from '../src';

describe('Node-Based Visual Compositing Engine Tests', () => {
  let engine: NodeCompositingEngine;
  let context: ExecutionContext;

  beforeEach(() => {
    engine = new NodeCompositingEngine();
    context = {
      currentTime: 0,
      fps: 30,
      width: 1920,
      height: 1080,
      cache: new Map(),
      variables: {},
    };
  });

  test('Should load a template green-screen compositing DAG', () => {
    const templateLoader = engine.createTemplateLoader();
    const graph = templateLoader.loadChromaKeyTemplate('g1');

    expect(graph.nodes.length).toBe(6);
    expect(graph.connections.length).toBe(6);
    expect(graph.bookmarks.length).toBe(2);
  });

  test('Should correctly sort DAG topologically using DFS to calculate execution order', () => {
    const templateLoader = engine.createTemplateLoader();
    const graph = templateLoader.loadChromaKeyTemplate('g1');
    const executionEngine = engine.createExecutionEngine();

    const topOrder = executionEngine.getTopologicalOrder(graph);
    expect(topOrder.length).toBe(6);

    // Terminal render node must be evaluated AFTER the blending node
    const renderNodeIndex = topOrder.findIndex((n) => n.type === 'video_writer');
    const mergeNodeIndex = topOrder.findIndex((n) => n.type === 'blend_merge');

    expect(renderNodeIndex).toBeGreaterThan(mergeNodeIndex);
  });

  test('Should execute topologically and store output values inside Execution Cache', async () => {
    const templateLoader = engine.createTemplateLoader();
    const graph = templateLoader.loadChromaKeyTemplate('g2');
    const executionEngine = engine.createExecutionEngine();

    const report = await executionEngine.executeGraph(graph, context);
    expect(report.status).toBe('completed');
    expect(report.evaluatedNodeIds.length).toBe(6);

    // Verify cache outputs exist
    const cache = executionEngine.getCache();
    expect(cache.size).toBe(5); // 5 nodes write outputs (render node has no output port)
  });

  test('Should handle incremental evaluation skipping clean cached nodes', async () => {
    const templateLoader = engine.createTemplateLoader();
    const graph = templateLoader.loadChromaKeyTemplate('g3');
    const executionEngine = engine.createExecutionEngine();

    // First run (populates cache)
    await executionEngine.executeGraph(graph, context);

    // Mark single node dirty (simulate sliding green spill slider)
    const keyer = graph.nodes.find((n) => n.type === 'chroma_key');
    if (keyer) {
      keyer.isDirty = true;
    }

    // Run again
    const report = await executionEngine.executeGraph(graph, context);

    // Only keyer, blur, merge, and writer should execute. Inputs should be bypassed using cache!
    expect(report.evaluatedNodeIds.length).toBeLessThan(6);
  });

  test('Should perform Dead Node Elimination on un-connected node branches', () => {
    const templateLoader = engine.createTemplateLoader();
    const graph = templateLoader.loadChromaKeyTemplate('g4');
    const optimizer = engine.createOptimizer();

    // Add a floating, disconnected node
    const deadNode: Node = {
      id: 'node_floating_garbage',
      name: 'Unconnected Blur',
      category: 'blur',
      type: 'gaussian_blur',
      position: { x: 0, y: 0 },
      inputs: [{ id: 'p_in_1', name: 'input', direction: 'input', type: 'image' }],
      outputs: [{ id: 'p_out_1', name: 'image', direction: 'output', type: 'image' }],
      properties: {},
    };
    graph.nodes.push(deadNode);

    expect(graph.nodes.length).toBe(7);

    // Optimize
    const eliminated = optimizer.eliminateDeadNodes(graph);
    expect(eliminated).toBe(1);
    expect(graph.nodes.some((n) => n.id === 'node_floating_garbage')).toBe(false);
  });

  test('Should execute constant folding optimizations on pure algebraic sub-sections', () => {
    const graph: NodeGraph = {
      id: 'g5',
      name: 'Algebraic Addition Graph',
      nodes: [
        {
          id: 'n1',
          name: 'Add Constants',
          category: 'math',
          type: 'math_add',
          position: { x: 0, y: 0 },
          inputs: [
            { id: 'port_a', name: 'a', direction: 'input', type: 'number', value: 15 },
            { id: 'port_b', name: 'b', direction: 'input', type: 'number', value: 25 },
          ],
          outputs: [{ id: 'port_out', name: 'value', direction: 'output', type: 'number' }],
          properties: {},
        },
      ],
      connections: [],
      groups: [],
      bookmarks: [],
      version: '1.0.0',
    };

    const optimizer = engine.createOptimizer();
    const optimizedCount = optimizer.foldConstants(graph);

    expect(optimizedCount).toBe(1);
    expect(graph.nodes[0].type).toBe('constant');
    expect(graph.nodes[0].outputs[0].value).toBe(40);
  });
});
