import React from 'react';
import { assetLibrary } from '../services';

interface RightsManagementPanelProps {
  assetId: string;
}

export const RightsManagementPanel: React.FC<RightsManagementPanelProps> = ({ assetId }) => {
  const asset = assetLibrary.getAsset(assetId);

  if (!asset) return null;

  return (
    <div style={{ marginTop: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>Digital Rights & Usage Limits</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ccc' }}>
        <span>Commercial Use Allowed: {asset.license.commercialUse ? 'Yes ✓' : 'No ✗'}</span>
        <span>Territory: {asset.license.territory || 'Global'}</span>
      </div>
    </div>
  );
};
export default RightsManagementPanel;
