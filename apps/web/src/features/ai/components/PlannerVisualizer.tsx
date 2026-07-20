import React from 'react';
import { useAgentRuntime } from '../hooks/useAgentRuntime';

export const PlannerVisualizer: React.FC = () => {
  const { currentPlan } = useAgentRuntime();

  if (!currentPlan) {
    return (
      <div style={{ padding: '16px', background: '#111', color: '#666', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontSize: '11px' }}>
        No active execution plans.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        Active Planner Topology ({currentPlan.strategy.toUpperCase()})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {currentPlan.tasks.map((task) => {
          const statusColor =
            task.status === 'completed'
              ? '#2e7d32'
              : task.status === 'failed'
              ? '#c62828'
              : task.status === 'running'
              ? '#f57c00'
              : '#333';

          return (
            <div
              key={task.id}
              style={{
                padding: '8px',
                background: '#1a1a1a',
                border: `1px solid ${statusColor}`,
                borderRadius: '3px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>{task.id.toUpperCase()}</span>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '2px',
                    fontSize: '9px',
                    background: statusColor,
                    color: '#fff',
                  }}
                >
                  {task.status.toUpperCase()}
                </span>
              </div>
              <div>{task.description}</div>
              {task.dependencies.length > 0 && (
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
                  Depends on: {task.dependencies.join(', ').toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
