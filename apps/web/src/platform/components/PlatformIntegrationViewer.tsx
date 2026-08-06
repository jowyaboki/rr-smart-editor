import React from 'react';
import { usePlatform } from '../hooks/usePlatform';

export const PlatformIntegrationViewer: React.FC = () => {
  const { modules, healthStatus, timelineEvents } = usePlatform();

  return (
    <div
      style={{
        background: '#1c1c1c',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #333',
        color: '#fff',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: '20px',
          fontSize: '16px',
          color: '#00e5ff',
          borderBottom: '1px solid #333',
          paddingBottom: '10px',
        }}
      >
        📊 Live Platform Integration & Dependency Graph
      </h3>

      {/* HEALTH STATUS SUMMARY */}
      {healthStatus && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: '#252526',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: '#888' }}>PLATFORM CORE STATUS</div>
            <strong
              style={{ fontSize: '18px', color: '#4caf50', marginTop: '4px', display: 'block' }}
            >
              {healthStatus.status.toUpperCase()}
            </strong>
          </div>
          <div
            style={{
              background: '#252526',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', color: '#888' }}>HEARTBEAT TIMESTAMP</div>
            <strong style={{ fontSize: '13px', color: '#fff', marginTop: '6px', display: 'block' }}>
              {new Date(healthStatus.heartbeatTime).toLocaleTimeString()}
            </strong>
          </div>
        </div>
      )}

      {/* ACTIVE DEPENDENCY LISTING */}
      <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>
          Topological Module Dependency Graph
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {modules.map((m) => (
            <div
              key={m.id}
              style={{
                background: '#252526',
                padding: '8px 12px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
              }}
            >
              <div>
                <strong>{m.name}</strong>
                <span style={{ color: '#888', marginLeft: '8px' }}>
                  dependencies: [ {m.dependencies.join(', ') || 'None'} ]
                </span>
              </div>
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{m.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STARTUP TIMELINE */}
      <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>
          Diagnostics Startup Sequence Timeline
        </h4>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          {timelineEvents.map((evt, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#ccc',
                padding: '4px 0',
                borderBottom: '1px solid #222',
              }}
            >
              <span>{evt.task}</span>
              <strong style={{ color: '#00e5ff' }}>{evt.durationMs}ms</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformIntegrationViewer;
