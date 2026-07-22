import React from 'react';
import { useExecutionMonitor } from '../hooks/useExecutionMonitor';

export const ExecutionMonitorTimeline: React.FC = () => {
  const { executionSteps } = useExecutionMonitor();

  const stepsList = Object.values(executionSteps);

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Execution Timeline & Telemetry
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {stepsList.length === 0 && (
          <div style={{ color: '#666', fontSize: '10px', textAlign: 'center', padding: '12px 0' }}>
            No executions run. Trigger nodes to inspect durations.
          </div>
        )}
        {stepsList.map((step) => (
          <div
            key={step.nodeId}
            style={{
              padding: '6px',
              background: '#1a1a1a',
              borderRadius: '2px',
              fontSize: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Node: {step.nodeId}</span>
            <span style={{ textTransform: 'uppercase', color: step.status === 'completed' ? '#4caf50' : '#ff9800' }}>
              {step.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExecutionMonitorTimeline;
