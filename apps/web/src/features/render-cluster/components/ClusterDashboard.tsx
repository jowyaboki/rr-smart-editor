import React, { useEffect } from 'react';
import { useClusterStore } from '../store/clusterStore';
import { NodeList } from './NodeList';
import { ScalingConfig } from './ScalingConfig';
import { ShardMonitor } from './ShardMonitor';

export const ClusterDashboard: React.FC = () => {
  const { metrics, events, initCluster, clearEvents } = useClusterStore();

  useEffect(() => {
    initCluster();
  }, []);

  const renderTelemetryWidget = (label: string, value: string | number, color: string, subText?: string) => {
    return (
      <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color }}>{value}</div>
        </div>
        {subText && <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>{subText}</div>}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>📦</span> Distributed Rendering Cluster Management
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
            Horizontal rendering cloud/hybrid load balancer orchestrating frame chunking, priority scheduling and auto-scaling.
          </p>
        </div>
        <button
          onClick={initCluster}
          style={{
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🔄 Synchronize Cluster
        </button>
      </div>

      {/* Aggregate telemetry dials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {renderTelemetryWidget('Active Worker Pool Size', `${metrics.totalNodes} Nodes`, '#4caf50', `${metrics.activeNodes} busy | ${metrics.idleNodes} idle`)}
        {renderTelemetryWidget('Aggregated CPU Utilization', `${metrics.averageCpuUsage.toFixed(0)}%`, '#ff9800', `Load balance capability limit`)}
        {renderTelemetryWidget('Cluster Shard Throughput', `${metrics.renderThroughputFps} FPS`, '#2196f3', `Distributed parallel encoding speed`)}
        {renderTelemetryWidget('Projected spend rate', `$${metrics.aggregatedCost.toFixed(2)}/hr`, '#e91e63', `Currency: ${metrics.currency}`)}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left Hand: Node list and Sharding simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <NodeList />
          <ShardMonitor />
        </div>

        {/* Right Hand: Auto scaling, logs, and events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ScalingConfig />

          {/* Event Logs console */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#aaa' }}>🛡️ Cluster Activity Events</h3>
              <button onClick={clearEvents} style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase' }}>Clear log</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {events.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>No cluster events logged yet.</div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} style={{ background: '#252526', padding: '10px', borderRadius: '4px', borderLeft: `3px solid ${evt.severity === 'error' ? '#f44336' : evt.severity === 'warning' ? '#ff9800' : '#4caf50'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '2px' }}>
                      <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{evt.type.replace(/_/g, ' ')}</span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#eee', lineHeight: '1.4' }}>{evt.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
