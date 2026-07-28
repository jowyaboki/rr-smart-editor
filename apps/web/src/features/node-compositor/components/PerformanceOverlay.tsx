import React from 'react';
import { useCompositorStore } from '../store/compositorStore';

export const PerformanceOverlay: React.FC = () => {
  const { executionHistory, isExecuting } = useCompositorStore();

  const lastReport = executionHistory[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#16161a',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #27272a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 600, color: '#f8fafc' }}>
        ⚡ GPU Node Graph Performance
      </h4>

      {lastReport ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa' }}>Execution Status:</span>
            <strong style={{ color: lastReport.status === 'completed' ? '#10b981' : '#ef4444' }}>
              {lastReport.status.toUpperCase()}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa' }}>Processing Delay:</span>
            <strong style={{ color: '#3b82f6' }}>{lastReport.durationMs} ms</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa' }}>Evaluated Nodes:</span>
            <strong style={{ color: '#e2e8f0' }}>{lastReport.evaluatedNodeIds.length} Nodes</strong>
          </div>

          <div
            style={{
              borderTop: '1px solid #27272a',
              paddingTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: '#a1a1aa' }}>Constant Folding:</span>
            <strong style={{ color: '#10b981' }}>Active (Optimized)</strong>
          </div>
        </div>
      ) : (
        <span style={{ fontSize: '11px', color: '#71717a' }}>
          No execution reports dispatched yet.
        </span>
      )}
    </div>
  );
};
