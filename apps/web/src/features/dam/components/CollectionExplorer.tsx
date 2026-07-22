import React from 'react';

export const CollectionExplorer: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '6px 0', overflowX: 'auto', width: '100%' }}>
      <div style={{ padding: '4px 10px', background: '#333', borderRadius: '3px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        📁 Folders: Corporate Media
      </div>
      <div style={{ padding: '4px 10px', background: '#333', borderRadius: '3px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        ★ Favorites Collection
      </div>
      <div style={{ padding: '4px 10px', background: '#1976d2', borderRadius: '3px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        ⚡ Smart Collection: Approved Video Clips
      </div>
    </div>
  );
};
export default CollectionExplorer;
