import React from 'react';
import { SearchPanel } from './SearchPanel';
import { AssetRecommendations } from './AssetRecommendations';
import { AssetClusters } from './AssetClusters';
import { ModerationReport } from './ModerationReport';
import { useAssetIntelligenceStore } from '../store/assetIntelligenceStore';

export const IntelligenceDashboard: React.FC = () => {
  const { activeAsset, analyzeAsset, isLoading } = useAssetIntelligenceStore();

  return (
    <div style={{ padding: '24px', background: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>🧠</span> Asset Intelligence & Semantic Search
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
          Cognitive semantic search indexing, vision concept extractions, speech transcribing, content safety checks, and smart suggestions.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>

        {/* Left Side: Search & Clusters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SearchPanel />
          <AssetClusters />
        </div>

        {/* Right Side: Active Asset Inspector, Recommendations & Moderation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeAsset ? (
            <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#4caf50' }}>
                  ℹ️ Active Asset Inspector
                </h3>
                <button
                  onClick={() => analyzeAsset(activeAsset.id)}
                  disabled={isLoading}
                  style={{
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {isLoading ? 'Processing...' : 'Run Cognitive AI'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Asset Title</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{activeAsset.metadata.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Description</div>
                  <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4' }}>{activeAsset.metadata.description}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>File Location (URL)</div>
                  <code style={{ fontSize: '12px', color: '#2196f3', wordBreak: 'break-all' }}>{activeAsset.url}</code>
                </div>

                {activeAsset.metadata.aiGeneratedTags && activeAsset.metadata.aiGeneratedTags.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', marginBottom: '6px' }}>Cognitive Tags</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {activeAsset.metadata.aiGeneratedTags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '10px',
                            background: '#2d2d30',
                            color: '#eee',
                            padding: '3px 8px',
                            borderRadius: '3px',
                          }}
                        >
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: '#1e1e1e', padding: '40px 20px', borderRadius: '8px', border: '1px solid #333', textAlign: 'center', color: '#888' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📁</span>
              Select any asset file from search panel to display the AI cognitive inspector, recommendations, and quality audits.
            </div>
          )}

          <AssetRecommendations />
          <ModerationReport />
        </div>

      </div>
    </div>
  );
};
