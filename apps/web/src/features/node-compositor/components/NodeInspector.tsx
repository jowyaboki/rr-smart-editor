import React from 'react';
import { useCompositorStore } from '../store/compositorStore';

export const NodeInspector: React.FC = () => {
  const { graph, selectedNodeId, updateNodeProperties, removeNode } = useCompositorStore();

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div
        style={{
          padding: '24px 0',
          textAlign: 'center',
          color: '#71717a',
          fontFamily: 'sans-serif',
        }}
      >
        <p style={{ fontSize: '13px' }}>⚙️ No Node Selected</p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>
          Select any processing node on the visual canvas to inspect variables, adjust tolerances,
          or set filters.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'sans-serif',
        color: '#e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 600, color: '#f8fafc' }}>
          Node Inspector
        </h3>
        <button
          onClick={() => removeNode(selectedNode.id)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#ef444420',
            color: '#ef4444',
            border: '1px solid #ef444440',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Delete Node
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#1e1e24',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #27272a',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedNode.name}</div>
        <div
          style={{
            fontSize: '10px',
            color: '#71717a',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          Type: {selectedNode.type} | Cat: {selectedNode.category}
        </div>
      </div>

      {/* PROPERTIES CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span
          style={{
            fontSize: '11px',
            color: '#a1a1aa',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Adjust Parameters:
        </span>

        {Object.keys(selectedNode.properties).map((key) => {
          const val = selectedNode.properties[key];

          return (
            <div key={key}>
              <label
                style={{
                  fontSize: '11px',
                  color: '#a1a1aa',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {key}
              </label>

              {typeof val === 'number' ? (
                <input
                  type="number"
                  value={val}
                  onChange={(e) => {
                    updateNodeProperties(selectedNode.id, {
                      [key]: parseFloat(e.target.value) || 0,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    backgroundColor: '#1e1e24',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              ) : typeof val === 'boolean' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => {
                      updateNodeProperties(selectedNode.id, { [key]: e.target.checked });
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px' }}>Enabled</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => {
                    updateNodeProperties(selectedNode.id, { [key]: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    backgroundColor: '#1e1e24',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
