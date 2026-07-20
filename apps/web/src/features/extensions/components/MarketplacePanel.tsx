import React from 'react';
import { useExtensionManager } from '../hooks/useExtensionManager';

export const MarketplacePanel: React.FC = () => {
  const { extensions, searchQuery, setSearchQuery, installExtension } = useExtensionManager();

  const handleInstallMock = (ext: any) => {
    installExtension({
      id: ext.id,
      name: ext.name,
      displayName: ext.displayName,
      description: ext.description,
      version: ext.version,
      author: 'Mock Author',
      category: ext.category as any,
      permissions: ['network'],
      activationEvents: [],
      entry: 'dist/index.js',
      editorVersion: '1.0.0',
      engineVersion: '1.0.0',
      signature: `sha256-verified-${ext.id}`,
    });
  };

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px' }}>Extension Marketplace</h4>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search extensions..."
          style={{ padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', width: '150px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {extensions.filter(e => !e.installed).map((ext) => (
          <div key={ext.id} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{ext.displayName}</span>
              <button
                onClick={() => handleInstallMock(ext)}
                style={{ padding: '2px 8px', fontSize: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                Install
              </button>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#aaa' }}>{ext.description}</p>
            <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#666' }}>
              <span>Version: {ext.version}</span>
              <span>Downloads: {ext.downloads}</span>
              <span>★ {ext.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
