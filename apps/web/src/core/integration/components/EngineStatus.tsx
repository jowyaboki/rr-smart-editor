import React, { useState, useEffect } from 'react';
import { IntegrationService } from '../IntegrationService';
import { EngineInfo } from '../EngineRegistry';

export const EngineStatus: React.FC = () => {
  const [service] = useState(() => new IntegrationService());
  const [diagnostics, setDiagnostics] = useState<EngineInfo[]>([]);
  const [initializing, setInitializing] = useState(false);

  const fetchDiagnostics = () => {
    setDiagnostics(service.getDiagnostics());
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      await service.lifecycle.initializeAll();
      fetchDiagnostics();
    } catch (e) {
      console.error(e);
    } finally {
      setInitializing(false);
    }
  };

  const handleRestart = async () => {
    setInitializing(true);
    try {
      await service.lifecycle.restart();
      fetchDiagnostics();
    } catch (e) {
      console.error(e);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div style={{ padding: '16px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', maxWidth: '600px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>Runtime Core Integration Diagnostics</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleInitialize}
            disabled={initializing}
            style={{ padding: '4px 12px', fontSize: '11px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            Start Core
          </button>
          <button
            onClick={handleRestart}
            disabled={initializing}
            style={{ padding: '4px 12px', fontSize: '11px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            Restart Runtime
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
        {diagnostics.map((eng) => {
          const healthColor =
            eng.health === 'healthy'
              ? '#4caf50'
              : eng.health === 'degraded'
              ? '#ff9800'
              : '#f44336';

          return (
            <div
              key={eng.name}
              style={{
                padding: '8px 12px',
                background: '#1a1a1a',
                border: '1px solid #222',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{eng.name}</span>
                <span style={{ fontSize: '10px', color: '#666', marginLeft: '6px' }}>v{eng.version}</span>
                <div style={{ fontSize: '9px', color: '#888', marginTop: '4px' }}>
                  Dependencies: {eng.dependencies.length > 0 ? eng.dependencies.join(', ') : 'None'}
                </div>
                {eng.error && (
                  <div style={{ fontSize: '9px', color: '#f44336', marginTop: '2px' }}>
                    Error: {eng.error}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>{eng.status}</span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: healthColor,
                    display: 'inline-block',
                  }}
                  title={eng.health}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default EngineStatus;
