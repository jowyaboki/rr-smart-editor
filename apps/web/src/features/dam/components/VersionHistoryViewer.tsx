import React from 'react';
import { assetLibrary } from '../services';

interface VersionHistoryViewerProps {
  assetId: string;
}

export const VersionHistoryViewer: React.FC<VersionHistoryViewerProps> = ({ assetId }) => {
  const asset = assetLibrary.getAsset(assetId);

  if (!asset) return null;

  return (
    <div style={{ marginTop: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>Version History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {asset.versions.map((ver) => (
          <div key={ver.version} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#aaa' }}>
            <span>v{ver.version} - {ver.changelog || 'Uploaded'}</span>
            <span>{new Date(ver.uploadedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default VersionHistoryViewer;
