import React from 'react';
import { useDAMLibrary } from '../hooks/useDAMLibrary';
import { CollectionExplorer } from './CollectionExplorer';
import { MetadataInspector } from './MetadataInspector';
import { ApprovalWorkflowPanel } from './ApprovalWorkflowPanel';
import { VersionHistoryViewer } from './VersionHistoryViewer';
import { RightsManagementPanel } from './RightsManagementPanel';
import { AssetUsageTracker } from './AssetUsageTracker';

export const AssetLibraryBrowser: React.FC = () => {
  const { assets, searchQuery, setSearchQuery, togglePin } = useDAMLibrary();

  return (
    <div style={{ padding: '16px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', maxWidth: '650px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>Enterprise DAM Platform</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Smart search (speech transcripts, AI tags, filename)..."
          style={{ padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', width: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <CollectionExplorer />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {assets.map((asset) => (
          <div key={asset.id} style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{asset.displayName}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => togglePin(asset.id)}
                  style={{ padding: '2px 6px', fontSize: '9px', background: asset.isPinned ? '#f57c00' : '#444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                >
                  {asset.isPinned ? '📌 Pinned' : 'Pin'}
                </button>
                <span style={{ fontSize: '9px', padding: '2px 6px', background: '#222', border: '1px solid #444', borderRadius: '2px', textTransform: 'uppercase' }}>
                  {asset.status}
                </span>
              </div>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#aaa' }}>Category: {asset.category.toUpperCase()}</p>

            {/* Nested DAM inspectors */}
            <MetadataInspector assetId={asset.id} />
            <ApprovalWorkflowPanel assetId={asset.id} />
            <VersionHistoryViewer assetId={asset.id} />
            <RightsManagementPanel assetId={asset.id} />
            <AssetUsageTracker assetId={asset.id} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default AssetLibraryBrowser;
