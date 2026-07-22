import React from 'react';
import { useWorkspaceAudits } from '../hooks/useWorkspaceAudits';

export const WorkspaceAuditLogs: React.FC = () => {
  const { auditLogs } = useWorkspaceAudits('ws-active');

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Compliance Audit Logs
      </span>
      <div style={{ background: '#000', padding: '6px', height: '100px', overflowY: 'auto', borderRadius: '2px', fontFamily: 'monospace', fontSize: '10px', color: '#aaa' }}>
        {auditLogs.length === 0 && (
          <div style={{ color: '#444', textAlign: 'center', marginTop: '30px' }}>No audit activities logged.</div>
        )}
        {auditLogs.map((log) => (
          <div key={log.id} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#888' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>{' '}
            <strong style={{ color: '#1976d2' }}>[{log.action.toUpperCase()}]</strong> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};
export default WorkspaceAuditLogs;
