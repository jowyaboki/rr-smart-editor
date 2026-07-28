import React from 'react';
import { listPaletteNodeTypes } from '../palette';

export const NodePalette: React.FC = () => {
  const nodeTypes = listPaletteNodeTypes();

  return (
    <div style={{ padding: '8px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>
        Draggable Nodes Palette
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            style={{
              padding: '6px 10px',
              background: '#1a1a1a',
              border: '1px solid #222',
              borderRadius: '2px',
              fontSize: '11px',
              cursor: 'grab',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{node.label}</span>
            <span style={{ fontSize: '8px', padding: '1px 4px', background: '#333', borderRadius: '2px', textTransform: 'uppercase', color: '#aaa' }}>
              {node.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NodePalette;
