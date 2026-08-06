import React from 'react';
import { useCompositorStore } from '../store/compositorStore';

export const LiveCanvas: React.FC = () => {
  const {
    graph,
    selectedNodeId,
    selectedPortId,
    heatmap,
    viewMode,
    selectNode,
    connectPorts,
    disconnectConnection,
  } = useCompositorStore();

  const handlePortClick = (nodeId: string, portId: string, direction: 'input' | 'output') => {
    // Basic wiring helper
    if (!selectedPortId) {
      // Store first port choice in global state
      useCompositorStore.setState({ selectedPortId: `${nodeId}::${portId}::${direction}` });
    } else {
      const [prevNodeId, prevPortId, prevDir] = selectedPortId.split('::');

      if (prevNodeId !== nodeId && prevDir !== direction) {
        // Connect them!
        if (prevDir === 'output') {
          connectPorts(prevNodeId, prevPortId, nodeId, portId);
        } else {
          connectPorts(nodeId, portId, prevNodeId, prevPortId);
        }
      }
      useCompositorStore.setState({ selectedPortId: null });
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#18181c',
        backgroundImage: 'radial-gradient(#2d2d34 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #27272a',
        minHeight: '400px',
      }}
    >
      {/* SVG Connections Layer */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {graph.connections.map((conn) => {
          const fromNode = graph.nodes.find((n) => n.id === conn.fromNodeId);
          const toNode = graph.nodes.find((n) => n.id === conn.toNodeId);

          if (!fromNode || !toNode) return null;

          // Simple coordinate approximation
          const x1 = fromNode.position.x + 160;
          const y1 = fromNode.position.y + 60;
          const x2 = toNode.position.x;
          const y2 = toNode.position.y + 60;

          return (
            <g key={conn.id}>
              <path
                d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  disconnectConnection(conn.id);
                }}
                title="Click to disconnect"
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 2 }}>
        {graph.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isDirty = node.isDirty;
          const tempColor =
            heatmap[node.id] === 'hot'
              ? '#ef4444'
              : heatmap[node.id] === 'warm'
                ? '#f59e0b'
                : '#3b82f6';

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                selectNode(node.id);
              }}
              style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: '180px',
                backgroundColor: '#1e1e24',
                border: isSelected ? '2px solid #3b82f6' : '1px solid #3f3f46',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontFamily: 'sans-serif',
                boxShadow: isSelected
                  ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                  : '0 4px 6px -1px rgba(0,0,0,0.2)',
                cursor: 'move',
              }}
            >
              {/* Node Title header block */}
              <div
                style={{
                  backgroundColor: viewMode === 'heatmap' ? tempColor : '#18181c',
                  padding: '6px 10px',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  borderBottom: '1px solid #27272a',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{node.name}</span>
                {isDirty && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                    }}
                    title="Unsaved Node Output"
                  />
                )}
              </div>

              {/* Ports (Inputs on Left, Outputs on Right) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '8px 6px',
                  gap: '8px',
                  fontSize: '10px',
                }}
              >
                {/* Inputs list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {node.inputs.map((p) => (
                    <div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortClick(node.id, p.id, 'input');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        color: '#a1a1aa',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          display: 'inline-block',
                        }}
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>

                {/* Outputs list */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'flex-end',
                  }}
                >
                  {node.outputs.map((p) => (
                    <div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortClick(node.id, p.id, 'output');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        color: '#a1a1aa',
                      }}
                    >
                      <span>{p.name}</span>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          display: 'inline-block',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
