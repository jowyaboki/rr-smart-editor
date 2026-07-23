import { useDesignerStore } from '../store/designerStore';
import { createDesignerNode } from '../nodes';
import { createDesignerEdge } from '../edges';
import { validateLayoutDefinition } from '../validation';

export function useWorkflowDesigner() {
  const store = useDesignerStore();

  const addNewNode = (type: string, name: string, x = 100, y = 100) => {
    const node = createDesignerNode(type, name, x, y);
    store.addNode(node);
    return node;
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    const edge = createDesignerEdge(sourceId, targetId);
    store.addEdge(edge);
    return edge;
  };

  const runLayoutValidation = () => {
    return validateLayoutDefinition({
      id: 'wf-val',
      name: 'Designer Workflow',
      description: 'Validation check',
      nodes: store.nodes,
      edges: store.edges,
      version: '1.0.0',
    });
  };

  return {
    nodes: store.nodes,
    edges: store.edges,
    addNewNode,
    removeNode: store.removeNode,
    updateNodePosition: store.updateNodePosition,
    updateNodeConfig: store.updateNodeConfig,
    connectNodes,
    removeEdge: store.removeEdge,
    runLayoutValidation,
  };
}
