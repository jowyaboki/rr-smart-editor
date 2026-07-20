import React from 'react';
import { useAgentRuntime } from '../hooks/useAgentRuntime';

export const ToolExecutorPanel: React.FC = () => {
  const { toolResults } = useAgentRuntime();

  if (toolResults.length === 0) {
    return (
      <div style={{ padding: '16px', background: '#111', color: '#666', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontSize: '11px' }}>
        No tools executed in this session.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        Tool Calling Telemetry Metrics
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {toolResults.map((res, idx) => (
          <div
            key={idx}
            style={{
              padding: '6px 8px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '2px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontWeight: 'bold', color: '#1976d2' }}>{res.callId}</span>
              <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
                Status: {res.success ? 'Success' : 'Failed'}
              </div>
            </div>
            <div>
              {res.success ? (
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Done</span>
              ) : (
                <span style={{ color: '#f44336', fontWeight: 'bold' }}>✗ Error: {res.error?.code}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
