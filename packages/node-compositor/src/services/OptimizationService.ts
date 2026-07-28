import { NodeGraph, Node, NodeConnection } from '../types';

export class OptimizationService {
  /**
   * Constant folding: Combines constant inputs from consecutive math nodes
   */
  public foldConstants(graph: NodeGraph): number {
    let optimizationsCount = 0;

    graph.nodes.forEach((node) => {
      if (node.type === 'math_add') {
        const aPort = node.inputs.find((i) => i.name === 'a');
        const bPort = node.inputs.find((i) => i.name === 'b');

        // Check if both ports have static literal constants and are not connected
        const isAConnected = graph.connections.some(
          (c) => c.toNodeId === node.id && c.toPortId === aPort?.id,
        );
        const isBConnected = graph.connections.some(
          (c) => c.toNodeId === node.id && c.toPortId === bPort?.id,
        );

        if (
          aPort &&
          bPort &&
          !isAConnected &&
          !isBConnected &&
          typeof aPort.value === 'number' &&
          typeof bPort.value === 'number'
        ) {
          // Fold into a single output
          const outputPort = node.outputs[0];
          if (outputPort) {
            outputPort.value = aPort.value + bPort.value;
            node.type = 'constant'; // Convert node to static constant output
            node.name = `Constant (${outputPort.value})`;
            optimizationsCount++;
          }
        }
      }
    });

    return optimizationsCount;
  }

  /**
   * Node Fusion: merges consecutive transform and blur filters into one compound kernel
   */
  public fuseConsecutiveTransforms(graph: NodeGraph): number {
    let fusionsCount = 0;
    // Walk connections to find Transform -> Transform chains
    const connectionsToFuse: string[] = [];

    graph.connections.forEach((conn) => {
      const parent = graph.nodes.find((n) => n.id === conn.fromNodeId);
      const child = graph.nodes.find((n) => n.id === conn.toNodeId);

      if (parent && child && parent.type === 'transform_2d' && child.type === 'transform_2d') {
        // Fuse! Adjust child positions and bypass parent
        const parentX = parent.properties.x || 0;
        const parentY = parent.properties.y || 0;

        child.properties.x = (child.properties.x || 0) + parentX;
        child.properties.y = (child.properties.y || 0) + parentY;

        // Bypass connection: reconnect grandchildren of parent directly to child
        const parentInputs = graph.connections.filter((c) => c.toNodeId === parent.id);
        parentInputs.forEach((inC) => {
          inC.toNodeId = child.id;
          // Map source connection output port properly
        });

        connectionsToFuse.push(parent.id);
        fusionsCount++;
      }
    });

    // Remove the fused redundant parent nodes
    connectionsToFuse.forEach((nodeId) => {
      graph.nodes = graph.nodes.filter((n) => n.id !== nodeId);
    });

    return fusionsCount;
  }

  /**
   * Dead Node Elimination: Cull un-connected output terminal node trees (or subgraphs that don't reach render/preview node)
   */
  public eliminateDeadNodes(graph: NodeGraph): number {
    const activeIds = new Set<string>();

    const traverse = (nodeId: string) => {
      if (activeIds.has(nodeId)) return;
      activeIds.add(nodeId);

      // Find parents feeding into this node's input ports
      const inputs = graph.connections.filter((c) => c.toNodeId === nodeId);
      inputs.forEach((inC) => {
        traverse(inC.fromNodeId);
      });
    };

    // Find all primary terminal rendering or publishing output nodes
    const terminalNodes = graph.nodes.filter(
      (n) => n.category === 'rendering' || n.type === 'video_writer' || n.isBookmarked,
    );

    terminalNodes.forEach((node) => {
      traverse(node.id);
    });

    if (terminalNodes.length === 0 && graph.nodes.length > 0) {
      // Fallback: treat the last node in the array as terminal to prevent full graph erasure
      traverse(graph.nodes[graph.nodes.length - 1].id);
    }

    const originalCount = graph.nodes.length;
    graph.nodes = graph.nodes.filter((n) => activeIds.has(n.id));

    // Cleanup broken connections
    graph.connections = graph.connections.filter(
      (c) => activeIds.has(c.fromNodeId) && activeIds.has(c.toNodeId),
    );

    return originalCount - graph.nodes.length;
  }
}
