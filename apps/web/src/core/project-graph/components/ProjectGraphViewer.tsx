import React, { useState, useMemo } from 'react';
import { useProjectGraphStore } from '../store/projectGraphStore';
import { NodeBuilders } from '../nodes/standardNodes';
import { EdgeBuilders } from '../edges/standardEdges';
import { DependencyResolver } from '../services';

export const ProjectGraphViewer: React.FC = () => {
  const {
    graph,
    selectedNodeId,
    setSelectedNodeId,
    snapshots,
    validationErrors,
    hotPaths,
    isExecuting,
    insertNode,
    removeNode,
    updateNodeValue,
    addEdge,
    removeEdge,
    clearGraph,
    propagateUpdates,
    takeSnapshot,
    restoreSnapshot,
  } = useProjectGraphStore();

  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<any>('clip');
  const [newNodeValue, setNewNodeValue] = useState('');

  const [edgeSourceId, setEdgeSourceId] = useState('');
  const [edgeTargetId, setEdgeTargetId] = useState('');
  const [edgeType, setEdgeType] = useState<any>('depends_on');

  const [customNodeValue, setCustomNodeValue] = useState('');

  // 1. Detect cycles
  const detectedCycles = useMemo(() => {
    return DependencyResolver.detectCycle(graph);
  }, [graph]);

  // Determine if a node is in a cycle
  const isNodeInCycle = (nodeId: string) => {
    return detectedCycles.some(cycle => cycle.includes(nodeId));
  };

  // Determine if an edge is in a cycle
  const isEdgeInCycle = (srcId: string, tgtId: string) => {
    return detectedCycles.some(cycle => {
      for (let i = 0; i < cycle.length - 1; i++) {
        if (cycle[i] === srcId && cycle[i + 1] === tgtId) {
          return true;
        }
      }
      return false;
    });
  };

  const handleAddNode = () => {
    if (!newNodeName) return;
    const id = `node_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const nodeBuilder = (NodeBuilders as any)[newNodeType];
    if (nodeBuilder) {
      const node = nodeBuilder(id, newNodeName, newNodeValue || `Default ${newNodeType}`);
      insertNode(node);
      setNewNodeName('');
      setNewNodeValue('');
    }
  };

  const handleAddEdge = () => {
    if (!edgeSourceId || !edgeTargetId || edgeSourceId === edgeTargetId) return;
    const id = `edge_${Date.now()}`;
    const edgeBuilder = (EdgeBuilders as any)[edgeType];
    if (edgeBuilder) {
      const edge = edgeBuilder(id, edgeSourceId, edgeTargetId);
      addEdge(edge);
      setEdgeSourceId('');
      setEdgeTargetId('');
    }
  };

  const handleUpdateValue = (nodeId: string) => {
    if (!customNodeValue) return;
    updateNodeValue(nodeId, customNodeValue);
    setCustomNodeValue('');
  };

  const handleTriggerPropagation = (nodeId: string) => {
    const recomputed = propagateUpdates(nodeId);
    alert(`Update propagated successfully! Recomputed ${recomputed.length} node(s): ${recomputed.join(', ')}`);
  };

  // Node position helper for SVG rendering (radial layout)
  const nodeIds = Object.keys(graph.nodes);
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const radius = 150;
    const centerX = 250;
    const centerY = 180;
    const count = nodeIds.length;

    nodeIds.forEach((id, index) => {
      const angle = (index / count) * 2 * Math.PI;
      positions[id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    return positions;
  }, [nodeIds]);

  return (
    <div style={{ padding: '24px', backgroundColor: '#0a1929', color: '#ffffff', fontFamily: 'sans-serif', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Project Graph Developer Engine</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { takeSnapshot('Manual snapshot'); }} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
            Take Snapshot
          </button>
          <button onClick={clearGraph} style={{ padding: '6px 12px', backgroundColor: '#ef5350', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
            Clear Graph
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left Side: Visual Graph Representation */}
        <div style={{ backgroundColor: '#102031', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Structural Dependencies & Cycle Tracking</h3>

          <div style={{ height: '360px', backgroundColor: '#0c1726', borderRadius: '6px', position: 'relative', overflow: 'hidden', border: '1px dashed #1e293b' }}>
            <svg style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#b2bac2" />
                </marker>
                <marker id="arrow-cycle" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef5350" />
                </marker>
              </defs>

              {/* Render edges */}
              {Object.values(graph.edges).map(edge => {
                const srcPos = nodePositions[edge.sourceId];
                const tgtPos = nodePositions[edge.targetId];
                if (!srcPos || !tgtPos) return null;

                const isCycle = isEdgeInCycle(edge.sourceId, edge.targetId);

                return (
                  <line
                    key={edge.id}
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isCycle ? '#ef5350' : '#475569'}
                    strokeWidth={isCycle ? '2.5' : '1.5'}
                    markerEnd={`url(#${isCycle ? 'arrow-cycle' : 'arrow'})`}
                  />
                );
              })}

              {/* Render Nodes as SVG Circles */}
              {Object.entries(graph.nodes).map(([id, node]) => {
                const pos = nodePositions[id];
                if (!pos) return null;

                const inCycle = isNodeInCycle(id);
                const updatesCount = hotPaths[id] || 0;
                // Highlight hot paths with yellow border glowing
                const isHot = updatesCount > 3;

                return (
                  <g key={id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => setSelectedNodeId(id)}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill={selectedNodeId === id ? '#3b82f6' : '#1e293b'}
                      stroke={inCycle ? '#ef5350' : isHot ? '#fbbf24' : '#475569'}
                      strokeWidth={isHot ? '3' : '1.5'}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9px"
                      fontWeight="bold"
                    >
                      {node.type.substring(0, 3).toUpperCase()}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y - 20}
                      textAnchor="middle"
                      fill="#b2bac2"
                      fontSize="10px"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {nodeIds.length === 0 && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.5 }}>
                No nodes. Use the form below to add some!
              </div>
            )}
          </div>

          {/* Quick Node & Edge Creators */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Add Node form */}
            <div style={{ backgroundColor: '#0d1a27', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Add Node</div>
              <input value={newNodeName} onChange={e => setNewNodeName(e.target.value)} placeholder="Node Name" style={{ width: '90%', padding: '4px', fontSize: '11px', marginBottom: '4px' }} />
              <div style={{ display: 'flex', gap: '4px' }}>
                <select value={newNodeType} onChange={e => setNewNodeType(e.target.value)} style={{ padding: '3px', fontSize: '11px' }}>
                  {['clip', 'asset', 'variable', 'expression', 'workflow', 'brand_kit', 'ai_task'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button onClick={handleAddNode} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#10b981', border: 'none', borderRadius: '2px', color: '#fff', cursor: 'pointer' }}>Insert</button>
              </div>
            </div>

            {/* Add Edge form */}
            <div style={{ backgroundColor: '#0d1a27', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Add Dependency Edge</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <select value={edgeSourceId} onChange={e => setEdgeSourceId(e.target.value)} style={{ padding: '3px', fontSize: '11px', width: '45%' }}>
                  <option value="">Source</option>
                  {nodeIds.map(id => (
                    <option key={id} value={id}>{graph.nodes[id].name}</option>
                  ))}
                </select>
                <select value={edgeTargetId} onChange={e => setEdgeTargetId(e.target.value)} style={{ padding: '3px', fontSize: '11px', width: '45%' }}>
                  <option value="">Target</option>
                  {nodeIds.map(id => (
                    <option key={id} value={id}>{graph.nodes[id].name}</option>
                  ))}
                </select>
                <select value={edgeType} onChange={e => setEdgeType(e.target.value)} style={{ padding: '3px', fontSize: '11px' }}>
                  {['depends_on', 'uses', 'references', 'generates'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button onClick={handleAddEdge} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#10b981', border: 'none', borderRadius: '2px', color: '#fff', cursor: 'pointer' }}>Connect</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Node Details & Live Evaluations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Node details */}
          <div style={{ backgroundColor: '#102031', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Node Inspector</h3>
            {selectedNodeId && graph.nodes[selectedNodeId] ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{graph.nodes[selectedNodeId].name}</span>
                  <span style={{ fontSize: '10px', backgroundColor: '#3b82f6', padding: '2px 6px', borderRadius: '10px' }}>
                    {graph.nodes[selectedNodeId].type.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#b2bac2', marginBottom: '8px' }}>
                  <div>ID: {selectedNodeId}</div>
                  <div>Version: {graph.nodes[selectedNodeId].state.version}</div>
                  <div>Dirty state: {graph.nodes[selectedNodeId].state.isDirty ? '🔴 Dirty' : '🟢 Clean'}</div>
                  <div>Updates / Writes: {hotPaths[selectedNodeId] || 0}</div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Value:</div>
                  <pre style={{ margin: 0, padding: '6px', backgroundColor: '#0a1929', borderRadius: '4px', fontSize: '11px', overflowX: 'auto' }}>
                    {JSON.stringify(graph.nodes[selectedNodeId].state.value, null, 2)}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <input value={customNodeValue} onChange={e => setCustomNodeValue(e.target.value)} placeholder="New Value" style={{ padding: '4px', fontSize: '11px', flex: 1 }} />
                  <button onClick={() => handleUpdateValue(selectedNodeId)} style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#10b981', border: 'none', color: '#fff', cursor: 'pointer' }}>Update</button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleTriggerPropagation(selectedNodeId)} style={{ flex: 1, padding: '6px', fontSize: '11px', backgroundColor: '#fbbf24', border: 'none', color: '#0a1929', fontWeight: 'bold', borderRadius: '3px', cursor: 'pointer' }}>
                    Propagate Update Cascade
                  </button>
                  <button onClick={() => removeNode(selectedNodeId)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#ef5350', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>
                    Delete Node
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.5, fontSize: '12px' }}>Select a node in the graph schema to inspect.</div>
            )}
          </div>

          {/* Validation & Snapshots Logs */}
          <div style={{ backgroundColor: '#102031', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', flex: 1 }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>System Logs & Snapshots</h3>

            {/* Cycles and Errors alerts */}
            {detectedCycles.length > 0 && (
              <div style={{ padding: '8px', backgroundColor: '#3a1e22', borderLeft: '4px solid #ef5350', fontSize: '11px', borderRadius: '3px', marginBottom: '10px' }}>
                <strong style={{ color: '#ef5350' }}>Circular Connection Loops Found:</strong>
                {detectedCycles.map((path, idx) => (
                  <div key={idx}>{path.join(' -> ')}</div>
                ))}
              </div>
            )}

            {validationErrors.length > 0 && (
              <div style={{ padding: '8px', backgroundColor: '#3a2e1d', borderLeft: '4px solid #fbbf24', fontSize: '11px', borderRadius: '3px', marginBottom: '10px' }}>
                <strong>Validation Warnings:</strong>
                {validationErrors.map((err, idx) => (
                  <div key={idx}>- {err.message}</div>
                ))}
              </div>
            )}

            {detectedCycles.length === 0 && validationErrors.length === 0 && (
              <div style={{ fontSize: '11px', color: '#10b981', marginBottom: '12px' }}>
                ✔ No circular connection loops or schema validation errors.
              </div>
            )}

            {/* Snapshots log list */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Snapshots Log</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                {snapshots.map(snap => (
                  <div key={snap.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1a27', padding: '4px 8px', borderRadius: '2px', fontSize: '11px' }}>
                    <span>{snap.description || snap.id}</span>
                    <button onClick={() => restoreSnapshot(snap.id)} style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: '#3b82f6', border: 'none', color: '#fff', borderRadius: '2px', cursor: 'pointer' }}>Revert</button>
                  </div>
                ))}
                {snapshots.length === 0 && (
                  <div style={{ fontSize: '11px', opacity: 0.5 }}>No snapshots taken yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
