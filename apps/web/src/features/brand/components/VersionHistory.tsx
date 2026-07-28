import React from 'react';
import { useBrandStore } from '../store/brandStore';

export const VersionHistory: React.FC = () => {
  const { versionsHistory } = useBrandStore();

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#ff9800', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        ⏳ Brand Version Snapshots
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {versionsHistory.map((snap) => (
          <div key={snap.version} style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: '#ff9800' }}>v{snap.version}</strong>
              <span style={{ fontSize: '11px', color: '#888' }}>{new Date(snap.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ color: '#ccc', fontSize: '12px' }}>Changelog: {snap.changelog}</div>
            <div style={{ color: '#aaa', fontSize: '11px', marginTop: '6px' }}>Author: {snap.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
