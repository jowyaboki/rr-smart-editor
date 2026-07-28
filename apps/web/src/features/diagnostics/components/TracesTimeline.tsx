import React from 'react';
import { useDiagnostics } from '../hooks/useDiagnostics';
import { webTracer } from '../services';

export const TracesTimeline: React.FC = () => {
  const traces = webTracer.listTraces();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Distributed Tracing Timeline Visualizer (Waterfall)
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {traces.length === 0 && (
          <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
            No traces recorded. Run render or playback tasks to capture traces.
          </div>
        )}
        {traces.map((trace) => (
          <div key={trace.id} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '3px', padding: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1976d2' }}>Trace ID: {trace.id}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {trace.spans.map((span) => (
                <div key={span.id} style={{ display: 'flex', alignItems: 'center', fontSize: '10px' }}>
                  <span style={{ width: '120px', color: '#888' }}>{span.name}</span>
                  <div style={{ flex: 1, background: '#333', height: '6px', borderRadius: '3px', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: span.parentId ? '30%' : '0%',
                        width: span.parentId ? '40%' : '100%',
                        height: '100%',
                        background: span.status === 'success' ? '#4caf50' : '#f44336',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <span style={{ width: '60px', textAlign: 'right', color: '#aaa', fontSize: '9px', marginLeft: '8px' }}>
                    {span.endTime ? `${span.endTime - span.startTime}ms` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TracesTimeline;
