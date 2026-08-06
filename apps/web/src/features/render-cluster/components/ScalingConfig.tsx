import React, { useState } from 'react';
import { useClusterStore } from '../store/clusterStore';

export const ScalingConfig: React.FC = () => {
  const { scalingPolicies, evaluateScaling } = useClusterStore();
  const [mockQueueDepth, setMockQueueDepth] = useState<number>(0);

  const policy = scalingPolicies[0];

  const handleTestScaling = () => {
    evaluateScaling(mockQueueDepth);
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#ff9800', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        ⚙️ Auto-Scaling Engine Configuration
      </h3>

      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <span style={{ color: '#aaa' }}>Active Scaling Strategy:</span>{' '}
          <strong style={{ textTransform: 'capitalize', color: '#ff9800' }}>
            Queue Depth Dynamic Escalations
          </strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
          <div style={{ background: '#252526', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
            <div style={{ color: '#aaa', fontSize: '11px', marginBottom: '2px' }}>Scale Up Threshold</div>
            <strong style={{ fontSize: '14px', color: '#f44336' }}>&gt; {policy.upperThreshold} jobs</strong>
          </div>
          <div style={{ background: '#252526', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
            <div style={{ color: '#aaa', fontSize: '11px', marginBottom: '2px' }}>Scale Down Threshold</div>
            <strong style={{ fontSize: '14px', color: '#4caf50' }}>&lt; {policy.lowerThreshold} jobs</strong>
          </div>
        </div>

        {/* Mock testing trigger */}
        <div style={{ borderTop: '1px solid #333', paddingTop: '16px', marginTop: '10px' }}>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
            Test Auto-Scaling Boundaries (Mock active rendering queue depth):
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={mockQueueDepth}
              onChange={(e) => setMockQueueDepth(parseInt(e.target.value) || 0)}
              style={{
                flex: '1',
                background: '#151515',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleTestScaling}
              style={{
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Evaluate Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
