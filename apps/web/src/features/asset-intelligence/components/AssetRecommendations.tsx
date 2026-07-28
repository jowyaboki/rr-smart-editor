import React from 'react';
import { useAssetIntelligenceStore } from '../store/assetIntelligenceStore';

export const AssetRecommendations: React.FC = () => {
  const { activeAsset, recommendations, inspectAsset, isLoading } = useAssetIntelligenceStore();

  if (!activeAsset) {
    return (
      <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#888', textAlign: 'center' }}>
        Select an asset from search results to generate recommendations.
      </div>
    );
  }

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#9c27b0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        💡 Cognitive Companion Recommendations
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Calculating scores...</div>
        ) : recommendations.length === 0 ? (
          <div style={{ padding: '12px', background: '#252526', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
            No related suggestions found.
          </div>
        ) : (
          recommendations.slice(0, 4).map((rec) => (
            <div
              key={rec.id}
              onClick={() => inspectAsset(rec.recommendedAsset.id)}
              style={{
                background: '#252526',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    background:
                      rec.type === 'frequently_used_together'
                        ? 'rgba(233, 30, 99, 0.15)'
                        : rec.type === 'brand_compatible'
                        ? 'rgba(76, 175, 80, 0.15)'
                        : 'rgba(156, 39, 176, 0.15)',
                    color:
                      rec.type === 'frequently_used_together'
                        ? '#e91e63'
                        : rec.type === 'brand_compatible'
                        ? '#4caf50'
                        : '#9c27b0',
                    textTransform: 'uppercase',
                  }}
                >
                  {rec.type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4caf50' }}>
                  {Math.round(rec.score * 100)}% Match
                </span>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                {rec.recommendedAsset.metadata.title}
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                {rec.reason}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
