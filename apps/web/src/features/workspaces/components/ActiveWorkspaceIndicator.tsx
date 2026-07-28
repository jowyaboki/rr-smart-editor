import React from 'react';
import { useWorkspace } from '../hooks/useWorkspace';

export const ActiveWorkspaceIndicator: React.FC = () => {
  const { activeContext } = useWorkspace();

  if (!activeContext) return null;

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: '#333', color: '#fff', border: '1px solid #444', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }} />
      <span>Workspace: <strong>{activeContext.workspaceId.toUpperCase()}</strong> | Role: <strong style={{ color: '#1976d2' }}>{activeContext.role.toUpperCase()}</strong></span>
    </div>
  );
};
export default ActiveWorkspaceIndicator;
