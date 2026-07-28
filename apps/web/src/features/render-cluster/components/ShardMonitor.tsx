import React, { useState } from 'react';
import { useClusterStore } from '../store/clusterStore';

export const ShardMonitor: React.FC = () => {
  const { shards, splitJob } = useClusterStore();
  const [shardsCount, setShardsCount] = useState<number>(4);

  const handleGenerateShards = () => {
    splitJob('job_sundance', 2000, shardsCount);
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#2196f3' }}>🧩 Parallel Shard Monitor (Frame Sharding)</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={shardsCount}
            onChange={(e) => setShardsCount(parseInt(e.target.value) || 4)}
            style={{
              background: '#252526',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
            }}
          >
            <option value={4}>4 Shards</option>
            <option value={8}>8 Shards</option>
            <option value={16}>16 Shards</option>
          </select>
          <button
            onClick={handleGenerateShards}
            style={{
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Shard Render Job
          </button>
        </div>
      </div>

      {shards.length === 0 ? (
        <div style={{ padding: '24px', background: '#252526', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
          No active frame-sharded tasks currently rendering. Set frame count to generate assignments.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '12px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #2d2d2d', paddingBottom: '6px' }}>
            <span>Shard ID</span>
            <span>Frame Distribution Range</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {shards.map((shard) => (
              <div key={shard.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '12px', alignItems: 'center', fontSize: '13px', background: '#252526', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{shard.id}</span>

                {/* Visual bar distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc' }}>
                    <span>Frames {shard.startFrame} - {shard.endFrame}</span>
                    <span>{shard.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#111', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${shard.progress}%`, height: '100%', background: '#2196f3', borderRadius: '3px' }} />
                  </div>
                </div>

                <span style={{ textAlign: 'right', fontWeight: 'bold', color: '#4caf50', fontSize: '12px' }}>
                  PENDING
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
