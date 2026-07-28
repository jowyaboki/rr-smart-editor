import React, { useState } from 'react';
import { useDiagnostics } from '../hooks/useDiagnostics';

export const LogsConsole: React.FC = () => {
  const { logs } = useDiagnostics();
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(
    log =>
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.engine.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Streaming Event Logs</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter logs..."
          style={{ padding: '2px 8px', fontSize: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px' }}
        />
      </div>

      <div style={{ background: '#000', padding: '8px', height: '150px', overflowY: 'auto', borderRadius: '2px', border: '1px solid #222', fontFamily: 'monospace', fontSize: '10px' }}>
        {filteredLogs.length === 0 && (
          <div style={{ color: '#444', textAlign: 'center', marginTop: '50px' }}>No logs matching filter.</div>
        )}
        {filteredLogs.map((log) => {
          const color = log.level === 'error' ? '#f44336' : log.level === 'warning' ? '#ff9800' : '#4caf50';
          return (
            <div key={log.id} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span style={{ color, fontWeight: 'bold' }}>[{log.level.toUpperCase()}]</span>
              <span style={{ color: '#1976d2' }}>[{log.engine}]</span>
              <span>{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LogsConsole;
