import React from 'react';
import { useClusterStore } from '../store/clusterStore';
import { Node } from '@ai-video-editor/render-cluster';

export const NodeList: React.FC = () => {
  const { nodes, drainNode, removeNode, registerNode } = useClusterStore();

  const handleAddMockNode = () => {
    const num = nodes.length + 1;
    const mockNode: Node = {
      id: `mock_node_${num}`,
      name: `Cloud Dedicated Worker Node #${num}`,
      status: 'idle',
      capabilities: {
        gpuEnabled: true,
        gpuModel: 'NVIDIA RTX A5000',
        coresCount: 8,
        memoryGb: 32,
        supportedFormats: ['mp4', 'mov', 'png'],
      },
      telemetry: {
        cpuUsagePercent: 0,
        gpuUsagePercent: 0,
        memoryUsageMb: 0,
        storageUsageGb: 100,
        networkRxMb: 0,
        networkTxMb: 0,
      },
      costPerHour: 0.35,
      provider: 'gcp',
      lastHeartbeat: new Date().toISOString(),
    };
    registerNode(mockNode);
  };

  const getStatusColor = (status: Node['status']) => {
    switch (status) {
      case 'idle': return '#4caf50';
      case 'busy': return '#2196f3';
      case 'draining': return '#ff9800';
      case 'offline': return '#f44336';
      default: return '#888';
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#4caf50' }}>🖥️ Active Cluster Worker Nodes</h3>
        <button
          onClick={handleAddMockNode}
          style={{
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          + Provision Cloud Node
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {nodes.map((node) => (
          <div key={node.id} style={{ background: '#252526', padding: '16px', borderRadius: '6px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(node.status), marginRight: '8px' }} />
                  {node.name}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                  ID: {node.id} | Type: <span style={{ textTransform: 'uppercase' }}>{node.provider}</span> | {node.capabilities.coresCount} Cores | {node.capabilities.memoryGb}GB RAM
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {node.status !== 'draining' && node.status !== 'offline' && (
                  <button
                    onClick={() => drainNode(node.id)}
                    style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: '1px solid #ff9800', borderRadius: '2px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Drain
                  </button>
                )}
                <button
                  onClick={() => removeNode(node.id)}
                  style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '1px solid #f44336', borderRadius: '2px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Terminate
                </button>
              </div>
            </div>

            {/* Hardware limits and telemetry meters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px', background: '#1a1a1b', padding: '10px', borderRadius: '4px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: '2px' }}>
                  <span>CPU Usage</span>
                  <strong>{node.telemetry.cpuUsagePercent}%</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${node.telemetry.cpuUsagePercent}%`, height: '100%', background: '#4caf50' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: '2px' }}>
                  <span>GPU Usage</span>
                  <strong>{node.capabilities.gpuEnabled ? `${node.telemetry.gpuUsagePercent || 0}%` : 'N/A'}</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${node.capabilities.gpuEnabled ? (node.telemetry.gpuUsagePercent || 0) : 0}%`, height: '100%', background: '#2196f3' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
