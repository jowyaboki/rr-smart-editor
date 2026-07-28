import React from 'react';
import { useAssetIntelligenceStore } from '../store/assetIntelligenceStore';

export const ModerationReport: React.FC = () => {
  const { activeAsset, moderationResult, isLoading } = useAssetIntelligenceStore();

  if (!activeAsset) return null;

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#f44336', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        🛡️ Safety & Quality Compliance Audit
      </h3>

      {isLoading ? (
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Analyzing content quality...</div>
      ) : moderationResult ? (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: moderationResult.isFlagged ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              border: `1px solid ${moderationResult.isFlagged ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginRight: '10px' }}>
                {moderationResult.isFlagged ? '🚨' : '✅'}
              </span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: moderationResult.isFlagged ? '#f44336' : '#4caf50' }}>
                  {moderationResult.isFlagged ? 'Action Required' : 'Asset Fully Approved'}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  Compliance level of {Math.round(moderationResult.confidenceScore * 100)}%
                </div>
              </div>
            </div>
          </div>

          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#ccc', lineHeight: '1.4' }}>
            {moderationResult.details}
          </p>

          {moderationResult.isFlagged && (
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>
                Flagged Reasons:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {moderationResult.flagReasons.map((reason, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(244, 67, 54, 0.15)',
                      color: '#f44336',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                    }}
                  >
                    ⚠️ {reason.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Click analyze on active asset to trigger moderation check.</div>
      )}
    </div>
  );
};
