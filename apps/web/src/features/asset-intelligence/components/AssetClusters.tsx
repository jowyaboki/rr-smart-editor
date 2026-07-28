import React, { useEffect, useState } from 'react';
import { useAssetIntelligenceStore } from '../store/assetIntelligenceStore';
import { ClusterCriteria } from '@ai-video-editor/asset-intelligence';

export const AssetClusters: React.FC = () => {
  const { clusters, clusterLibrary, library, inspectAsset } = useAssetIntelligenceStore();
  const [criteria, setCriteria] = useState<ClusterCriteria>('topic');

  useEffect(() => {
    clusterLibrary(criteria);
  }, [criteria]);

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#ff9800' }}>
          🏷️ Semantic Asset Clusters
        </h3>
        <select
          value={criteria}
          onChange={(e) => setCriteria(e.target.value as ClusterCriteria)}
          style={{
            background: '#252526',
            color: '#fff',
            border: '1px solid #444',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="topic">Group by Topic Category</option>
          <option value="color_palette">Group by Color Palette</option>
          <option value="location">Group by Location</option>
          <option value="visual_style">Group by Visual Style</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clusters.map((cluster) => (
          <div key={cluster.id} style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#ff9800' }}>
              {cluster.name}
            </h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa' }}>
              {cluster.description}
            </p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {cluster.assetIds.map((id) => {
                const asset = library.find((a) => a.id === id);
                if (!asset) return null;
                return (
                  <span
                    key={id}
                    onClick={() => inspectAsset(id)}
                    style={{
                      fontSize: '11px',
                      background: '#151515',
                      color: '#eee',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #333',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ff9800')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
                  >
                    📄 {asset.metadata.title}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
