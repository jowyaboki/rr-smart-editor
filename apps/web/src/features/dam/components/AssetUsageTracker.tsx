import React from 'react';
import { assetLibrary } from '../services';

interface AssetUsageTrackerProps {
  assetId: string;
}

export const AssetUsageTracker: React.FC<AssetUsageTrackerProps> = ({ assetId }) => {
  const asset = assetLibrary.getAsset(assetId);

  if (!asset) return null;

  return (
    <div style={{ marginTop: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>Projects Usage Tracker</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ccc' }}>
        <span>Projects Active Count: {asset.usage.projectsUsedIn.length}</span>
        <span>Timeline Clips Insertions: {asset.usage.timelineClipsCount}</span>
      </div>
    </div>
  );
};
export default AssetUsageTracker;
