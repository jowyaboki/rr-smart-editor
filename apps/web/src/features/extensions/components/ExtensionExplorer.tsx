import React from 'react';
import { useExtensionManager } from '../hooks/useExtensionManager';

export const ExtensionExplorer: React.FC = () => {
  const { extensions, uninstallExtension, toggleEnabled } = useExtensionManager();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        Installed Extensions
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {extensions.filter(e => e.installed).length === 0 && (
          <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
            No extensions installed.
          </div>
        )}
        {extensions.filter(e => e.installed).map((ext) => (
          <div key={ext.id} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{ext.displayName}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => toggleEnabled(ext.id, ext.enabled)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    background: ext.enabled ? '#2e7d32' : '#555',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  {ext.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => uninstallExtension(ext.id)}
                  style={{ padding: '2px 6px', fontSize: '10px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                >
                  Uninstall
                </button>
              </div>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#aaa' }}>{ext.description}</p>
            <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#666' }}>
              <span>Version: {ext.version}</span>
              <span>Category: {ext.category.toUpperCase().replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
