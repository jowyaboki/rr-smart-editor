import { NodeGraph, Node, NodeConnection, ExecutionContext, NodeExecution } from '../types';

export class ExecutionService {
  private cache: Map<string, any> = new Map(); // Combined Node ID + Port ID -> computed value

  public getCache(): Map<string, any> {
    return this.cache;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Sorts the directed acyclic graph (DAG) topologically using Depth-First Search (DFS)
   */
  public getTopologicalOrder(graph: NodeGraph): Node[] {
    const order: Node[] = [];
    const visited = new Set<string>();
    const tempMark = new Set<string>();

    const visit = (nodeId: string) => {
      if (tempMark.has(nodeId)) {
        throw new Error(`Cycle detected inside Node Compositor DAG at node ID ${nodeId}!`);
      }
      if (!visited.has(nodeId)) {
        tempMark.add(nodeId);

        // Find parent nodes connected to current node inputs
        const incomingConnections = graph.connections.filter(c => c.toNodeId === nodeId);
        incomingConnections.forEach(c => {
          visit(c.fromNodeId);
        });

        tempMark.delete(nodeId);
        visited.add(nodeId);

        const node = graph.nodes.find(n => n.id === nodeId);
        if (node) {
          order.push(node);
        }
      }
    };

    graph.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    });

    return order;
  }

  /**
   * Evaluates the graph topologically, using caching to skip clean nodes (incremental recomputation)
   */
  public async executeGraph(graph: NodeGraph, context: ExecutionContext): Promise<NodeExecution> {
    const executionId = `exec_${Date.now()}`;
    const startTimeMs = Date.now();
    const evaluatedNodeIds: string[] = [];
    const errors: Array<{ nodeId: string; message: string }> = [];

    try {
      const topOrder = this.getTopologicalOrder(graph);

      // We can parallelize layer evaluation when nodes don't share sequential dependency paths
      for (const node of topOrder) {
        // Evaluate dynamic expressions or default constants
        const isClean = !node.isDirty && node.outputs.every(o => this.cache.has(`${node.id}_${o.id}`));
        if (isClean) {
          // Skip evaluation, use cache! (Lazy Incremental evaluation)
          continue;
        }

        evaluatedNodeIds.push(node.id);

        try {
          // Resolve input port values
          const resolvedInputs: Record<string, any> = {};
          node.inputs.forEach(port => {
            // Check if connected
            const conn = graph.connections.find(c => c.toNodeId === node.id && c.toPortId === port.id);
            if (conn) {
              resolvedInputs[port.name] = this.cache.get(`${conn.fromNodeId}_${conn.fromPortId}`);
            } else {
              resolvedInputs[port.name] = port.value; // Static value
            }
          });

          // Mock execution based on type (e.g. blend, scale, blur, logic operations)
          const outputs = await this.mockNodeExecute(node, resolvedInputs, context);

          // Write output port values to cache and clear dirty flag
          Object.keys(outputs).forEach(key => {
            const port = node.outputs.find(o => o.name === key);
            if (port) {
              this.cache.set(`${node.id}_${port.id}`, outputs[key]);
            }
          });

          node.isDirty = false;
        } catch (err: any) {
          errors.push({ nodeId: node.id, message: err?.message || 'Execution error' });
        }
      }
    } catch (graphErr: any) {
      errors.push({ nodeId: 'graph', message: graphErr?.message || 'Topological sort cycle error' });
    }

    return {
      id: executionId,
      graphId: graph.id,
      status: errors.length > 0 ? 'failed' : 'completed',
      startTimeMs,
      durationMs: Date.now() - startTimeMs,
      evaluatedNodeIds,
      errors,
    };
  }

  private async mockNodeExecute(node: Node, inputs: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    // Return output structures matching the nodes type
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate processing latency

    switch (node.type) {
      case 'gaussian_blur':
        return { image: `[Blurred Image with radius ${inputs.radius || 10}]` };
      case 'chroma_key':
        return { mask: `[Keyed Mask of color ${inputs.keyColor || '#00ff00'}]` };
      case 'transform_2d':
        return { image: `[Transformed Image at offset x: ${inputs.x || 0}, y: ${inputs.y || 0}]` };
      case 'blend_merge':
        return { image: `[Merged ${inputs.background || 'Black'} and ${inputs.foreground || 'White'} with mode ${inputs.mixMode || 'normal'}]` };
      case 'math_add':
        return { value: (parseFloat(inputs.a) || 0) + (parseFloat(inputs.b) || 0) };
      case 'ai_face_blur':
        return { image: '[AI Face-Detected Redacted Image Output]' };
      default:
        // Pass-through image/media
        return { output: inputs.input || '[Output stream default]' };
    }
  }
}
