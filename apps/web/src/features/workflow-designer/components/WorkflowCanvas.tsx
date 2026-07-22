import React from 'react';
import { useWorkflowDesigner } from '../hooks/useWorkflowDesigner';
import { useWorkflowDebugger } from '../hooks/useWorkflowDebugger';

export const WorkflowCanvas: React.FC = () => {
  const { nodes, edges, updateNodePosition } = useWorkflowDesigner();
  const { activeStepNodeId, breakpoints, executionSteps } = useWorkflowDebugger();

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000', border: '1px solid #222', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', color: '#444' }}>
        Visual Diagrams Automation Canvas
      </div>

      {nodes.map((node) => {
        const isActive = activeStepNodeId === node.id;
        const hasBp = breakpoints.includes(node.id);
        const step = executionSteps[node.id];

        const nodeColor = isActive
          ? '#f57c00'
          : step?.status === 'completed'
          ? '#2e7d32'
          : step?.status === 'failed'
          ? '#c62828'
          : '#333';

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
              padding: '6px 12px',
              background: '#1a1a1a',
              border: `1px solid ${nodeColor}`,
              borderRadius: '3px',
              fontSize: '11px',
              cursor: 'move',
            }}
          >
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {hasBp && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f44336' }} title="Breakpoint" />}
              <span style={{ fontWeight: 'bold' }}>{node.name}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
              Type: {node.type.toUpperCase()}
            </div>
          </div>
        );
      })}

      {/* Basic svg edges vector line */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {edges.map((edge) => {
          const source = nodes.find(n => n.id === edge.sourceNodeId);
          const target = nodes.find(n => n.id === edge.targetNodeId);
          if (!source || !target) return null;

          return (
            <line
              key={edge.id}
              x1={source.position.x + 40}
              y1={source.position.y + 15}
              x2={target.position.x}
              y2={target.position.y + 15}
              stroke="#444"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};
export default WorkflowCanvas;
