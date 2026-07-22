import React from 'react';
import { assetLibrary } from '../services';

interface MetadataInspectorProps {
  assetId: string;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({ assetId }) => {
  const asset = assetLibrary.getAsset(assetId);

  if (!asset) return null;

  return (
    <div style={{ marginTop: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>Metadata Details</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '10px', color: '#ccc' }}>
        <div>Resolution: {asset.metadata.resolution ? `${asset.metadata.resolution.width}x${asset.metadata.resolution.height}` : 'N/A'}</div>
        <div>Codec: {asset.metadata.codec || 'N/A'}</div>
        <div style={{ gridColumn: 'span 2' }}>
          AI Generated Tags: {asset.metadata.aiGeneratedTags ? asset.metadata.aiGeneratedTags.join(', ') : 'None'}
        </div>
      </div>
    </div>
  );
};
export default MetadataInspector;
