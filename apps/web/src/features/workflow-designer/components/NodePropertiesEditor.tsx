import React from 'react';

export const NodePropertiesEditor: React.FC = () => {
  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>
        Node Configuration Editor
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#aaa', width: '80px' }}>Node Label:</span>
          <input
            type="text"
            defaultValue="Trigger Proxy"
            style={{ padding: '2px 6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#aaa', width: '80px' }}>Retry Count:</span>
          <input
            type="number"
            defaultValue="3"
            style={{ padding: '2px 6px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', width: '50px' }}
          />
        </div>
      </div>
    </div>
  );
};
export default NodePropertiesEditor;
