import React, { useEffect } from 'react';
import { useAssetIntelligenceStore } from '../store/assetIntelligenceStore';

export const SearchPanel: React.FC = () => {
  const { searchQuery, searchResults, performSearch, setSearchQuery, inspectAsset, isLoading } = useAssetIntelligenceStore();

  useEffect(() => {
    performSearch();
  }, []);

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#2196f3', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        🔍 Semantic Concept Search
      </h3>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search assets semantically (e.g., 'golden hour slow waves on beach')"
          value={searchQuery.text || ''}
          onChange={(e) => setSearchQuery({ text: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && performSearch()}
          style={{
            flex: '1',
            background: '#151515',
            color: '#fff',
            border: '1px solid #444',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={performSearch}
          disabled={isLoading}
          style={{
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '0 24px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Threshold and weight sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            <span>Similarity Threshold</span>
            <span>{((searchQuery.threshold || 0.25) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={searchQuery.threshold || 0.25}
            onChange={(e) => setSearchQuery({ threshold: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
            <span>Keyword (Metadata) Weight</span>
            <span>{((searchQuery.hybridWeight || 0.5) * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={searchQuery.hybridWeight || 0.5}
            onChange={(e) => setSearchQuery({ hybridWeight: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {searchResults.length === 0 ? (
          <div style={{ padding: '20px', background: '#252526', borderRadius: '4px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
            No assets found matching the query criteria. Try adjusting the similarity threshold.
          </div>
        ) : (
          searchResults.map((res) => (
            <div
              key={res.asset.id}
              onClick={() => inspectAsset(res.asset.id)}
              style={{
                background: '#252526',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2d2d30')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#252526')}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {res.asset.metadata.title}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
                  Filename: {res.asset.name} | Type:{' '}
                  <span style={{ textTransform: 'uppercase' }}>{res.asset.metadata.fileType}</span>
                </div>
                {res.matchedConcepts.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {res.matchedConcepts.map((concept, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '10px',
                          background: 'rgba(33, 150, 243, 0.1)',
                          color: '#2196f3',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {concept.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                  {(res.score * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>Similarity Score</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
