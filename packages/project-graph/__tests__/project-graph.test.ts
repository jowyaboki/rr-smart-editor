import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  GraphEngine,
  DependencyResolver,
  InvalidationService,
  SnapshotService,
  GraphSerializer,
  GraphNode,
  GraphEdge,
} from '../src/index';

describe('Project Graph Engine Core Unit Tests', () => {

  test('Core Operations - Insert, Update, Remove Nodes and Ed edges', () => {
    const engine = new GraphEngine();

    const node1: GraphNode = {
      id: 'node_1',
      type: 'clip',
      name: 'Clip A',
      state: { value: 'clip_a_data', isDirty: false, version: 1 },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '1.0.0' },
    };

    const node2: GraphNode = {
      id: 'node_2',
      type: 'expression',
      name: 'Expression A',
      state: { value: 'time * 2', isDirty: false, version: 1 },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '1.0.0' },
    };

    // 1. Test insertion
    engine.insertNode(node1);
    engine.insertNode(node2);

    const graph = engine.getGraph();
    assert.ok(graph.nodes['node_1']);
    assert.ok(graph.nodes['node_2']);

    // 2. Test update
    engine.updateNodeValue('node_1', 'new_clip_data');
    assert.strictEqual(graph.nodes['node_1'].state.value, 'new_clip_data');
    assert.strictEqual(graph.nodes['node_1'].state.version, 2);
    assert.strictEqual(graph.nodes['node_1'].state.isDirty, true);

    // 3. Test edges
    const edge1: GraphEdge = {
      id: 'edge_1',
      sourceId: 'node_1',
      targetId: 'node_2',
      type: 'depends_on',
    };
    engine.addEdge(edge1);
    assert.ok(graph.edges['edge_1']);

    // 4. Test removal
    engine.removeNode('node_2');
    assert.strictEqual(graph.nodes['node_2'], undefined);
    // Removing node_2 should cascade and delete edge_1!
    assert.strictEqual(graph.edges['edge_1'], undefined);
  });

  test('Dependency Resolution and Cycle Detection', () => {
    const engine = new GraphEngine();

    const n1 = { id: 'A', type: 'variable', name: 'Var A', state: { value: 10, isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    const n2 = { id: 'B', type: 'variable', name: 'Var B', state: { value: '{A} * 2', isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    const n3 = { id: 'C', type: 'expression', name: 'Expr C', state: { value: '{B} + 5', isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;

    engine.insertNode(n1);
    engine.insertNode(n2);
    engine.insertNode(n3);

    // Build edges: C -> B -> A (C depends on B, B depends on A)
    engine.addEdge({ id: 'e1', sourceId: 'C', targetId: 'B', type: 'references' });
    engine.addEdge({ id: 'e2', sourceId: 'B', targetId: 'A', type: 'references' });

    const graph = engine.getGraph();

    // Direct dependencies of C should be [B]
    const directDepsC = DependencyResolver.getDirectDependencies('C', graph);
    assert.strictEqual(directDepsC.length, 1);
    assert.strictEqual(directDepsC[0].id, 'B');

    // Transitive dependencies of C should be [B, A]
    const transDepsC = DependencyResolver.getTransitiveDependencies('C', graph);
    assert.strictEqual(transDepsC.length, 2);
    assert.ok(transDepsC.some(n => n.id === 'B'));
    assert.ok(transDepsC.some(n => n.id === 'A'));

    // Transitive dependents of A should be [B, C]
    const transDepsA = DependencyResolver.getTransitiveDependents('A', graph);
    assert.strictEqual(transDepsA.length, 2);
    assert.ok(transDepsA.some(n => n.id === 'B'));
    assert.ok(transDepsA.some(n => n.id === 'C'));

    // Verify evaluation/topological order: A must evaluate before B, B must evaluate before C
    const order = engine.getTopologicalOrder();
    assert.ok(order.indexOf('A') < order.indexOf('B'));
    assert.ok(order.indexOf('B') < order.indexOf('C'));

    // Check no cycles initially
    const cycles = DependencyResolver.detectCycle(graph);
    assert.strictEqual(cycles.length, 0);

    // Introduce cycle: A -> C (A depends on C, creating A -> C -> B -> A)
    engine.addEdge({ id: 'e3', sourceId: 'A', targetId: 'C', type: 'depends_on' });
    const cyclesWithLoop = DependencyResolver.detectCycle(graph);
    assert.strictEqual(cyclesWithLoop.length, 1);
    assert.ok(cyclesWithLoop[0].includes('A'));
    assert.ok(cyclesWithLoop[0].includes('C'));

    // GraphEngine should throw cycle errors during topological sort
    assert.throws(() => {
      engine.getTopologicalOrder();
    }, /Circular dependency/);
  });

  test('Incremental Invalidation & Lazy Evaluations', () => {
    const engine = new GraphEngine();

    const n1 = { id: 'A', type: 'variable', name: 'Var A', state: { value: 10, isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    const n2 = { id: 'B', type: 'variable', name: 'Var B', state: { value: '{A} * 2', isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    const n3 = { id: 'C', type: 'expression', name: 'Expr C', state: { value: '{B} + 5', isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;

    engine.insertNode(n1);
    engine.insertNode(n2);
    engine.insertNode(n3);

    engine.addEdge({ id: 'e1', sourceId: 'C', targetId: 'B', type: 'references' });
    engine.addEdge({ id: 'e2', sourceId: 'B', targetId: 'A', type: 'references' });

    const graph = engine.getGraph();

    // Register custom compilers
    InvalidationService.registerEvaluator('variable', (node, deps) => {
      if (node.id === 'B') {
        const aVal = deps['A'];
        return aVal * 2;
      }
      return node.state.value;
    });

    InvalidationService.registerEvaluator('expression', (node, deps) => {
      const bVal = deps['B'];
      return bVal + 5;
    });

    // Mark starting node dirty and invalidate transitively
    engine.updateNodeValue('A', 20); // Value of A becomes 20, version increments, marked dirty
    InvalidationService.invalidateNode('A', graph);

    // Verify dirty states: A, B, and C must be marked dirty recursively!
    assert.strictEqual(graph.nodes['A'].state.isDirty, true);
    assert.strictEqual(graph.nodes['B'].state.isDirty, true);
    assert.strictEqual(graph.nodes['C'].state.isDirty, true);

    // Evaluate B incrementallly: should first evaluate A, then evaluate B
    const bResult = InvalidationService.evaluateNodeIncremental('B', graph);
    assert.strictEqual(bResult, 40); // 20 * 2
    assert.strictEqual(graph.nodes['B'].state.isDirty, false); // B is now clean

    // Evaluate C
    const cResult = InvalidationService.evaluateNodeIncremental('C', graph);
    assert.strictEqual(cResult, 45); // 40 + 5
    assert.strictEqual(graph.nodes['C'].state.isDirty, false); // C is now clean
  });

  test('Snapshot logs, Diffing, and Serialization', () => {
    const engine = new GraphEngine();
    const n1 = { id: 'A', type: 'variable', name: 'Var A', state: { value: 10, isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    engine.insertNode(n1);

    const graphBefore = JSON.parse(JSON.stringify(engine.getGraph()));

    // Take snapshot 1
    const snap1 = SnapshotService.createSnapshot(engine.getGraph(), 'Initial State');
    assert.strictEqual(snap1.version, 2); // Initial graph starts at 1, nodes insert increments to 2

    // Modify graph
    engine.updateNodeValue('A', 50);
    const n2 = { id: 'B', type: 'clip', name: 'Clip B', state: { value: 'clip', isDirty: false, version: 1 }, metadata: { createdAt: '', updatedAt: '', version: '1' } } as GraphNode;
    engine.insertNode(n2);

    const graphAfter = engine.getGraph();

    // Compute diff
    const diff = SnapshotService.diffGraphs(graphBefore, graphAfter);
    assert.strictEqual(diff.addedNodes.length, 1);
    assert.strictEqual(diff.addedNodes[0].id, 'B');
    assert.strictEqual(diff.updatedNodes.length, 1);
    assert.strictEqual(diff.updatedNodes[0].nodeId, 'A');

    // Restore snapshot
    const restored = SnapshotService.restoreSnapshot(snap1);
    assert.strictEqual(restored.nodes['A'].state.value, 10);
    assert.strictEqual(restored.nodes['B'], undefined);

    // Serialization
    const serialized = GraphSerializer.serializeGraph(graphAfter);
    assert.ok(typeof serialized === 'string');
    assert.ok(serialized.includes('Smart Editor Main Graph') || serialized.includes('Master Project Graph'));

    const deserialized = GraphSerializer.deserializeGraph(serialized);
    assert.strictEqual(deserialized.id, graphAfter.id);
    assert.strictEqual(deserialized.nodes['A'].state.value, 50);
  });
});
