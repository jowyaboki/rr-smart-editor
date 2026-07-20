import React, { useEffect } from 'react';
import { useDiagnostics } from '../hooks/useDiagnostics';

export const DashboardOverview: React.FC = () => {
  const { engineHealths, alerts, runHealthAudit } = useDiagnostics();

  useEffect(() => {
    runHealthAudit();
  }, []);

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px' }}>Production Diagnostics Overview</h4>
        <button
          onClick={runHealthAudit}
          style={{ padding: '3px 8px', fontSize: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', cursor: 'pointer' }}
        >
          Audit Health
        </button>
      </div>

      {/* Health statuses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        <div style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '3px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
            {engineHealths.filter(h => h.status === 'healthy').length}
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>Healthy Engines</div>
        </div>
        <div style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '3px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
            {engineHealths.filter(h => h.status === 'degraded').length}
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>Degraded</div>
        </div>
        <div style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '3px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>
            {engineHealths.filter(h => h.status === 'unhealthy').length}
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>Unhealthy</div>
        </div>
      </div>

      {/* Developer Alerts list */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Active Developer Warnings</span>
        {alerts.length === 0 ? (
          <div style={{ color: '#666', fontSize: '10px', padding: '4px 0' }}>No active alerts. Telemetry normal.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {alerts.map((al) => (
              <div key={al.id} style={{ padding: '6px', fontSize: '10px', background: '#2c0d0d', borderLeft: '3px solid #f44336', borderRadius: '2px' }}>
                <strong>[{al.engine.toUpperCase()}]</strong> {al.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardOverview;
