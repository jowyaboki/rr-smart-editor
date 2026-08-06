import React from 'react';
import { PermissionType } from '../types';

interface PermissionPromptDialogProps {
  visible: boolean;
  extensionName: string;
  requestedPermission: PermissionType;
  onResolve: (granted: boolean) => void;
}

export const PermissionPromptDialog: React.FC<PermissionPromptDialogProps> = ({
  visible,
  extensionName,
  requestedPermission,
  onResolve,
}) => {
  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ width: '320px', padding: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#ff9800' }}>Permission Requested</h4>
        <p style={{ fontSize: '12px', margin: '0 0 16px 0', color: '#ccc' }}>
          The extension <strong>{extensionName}</strong> is requesting access to: <br />
          <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', background: '#333', borderRadius: '3px', fontWeight: 'bold', color: '#fff' }}>
            {requestedPermission.toUpperCase().replace('_', ' ')}
          </span>
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => onResolve(false)}
            style={{ padding: '6px 16px', fontSize: '11px', background: '#555', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
          >
            Deny
          </button>
          <button
            onClick={() => onResolve(true)}
            style={{ padding: '6px 16px', fontSize: '11px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};
