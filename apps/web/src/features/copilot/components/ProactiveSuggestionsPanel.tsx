import React, { useEffect } from 'react';
import { useProactiveSuggestions } from '../hooks/useProactiveSuggestions';

export const ProactiveSuggestionsPanel: React.FC = () => {
  const { suggestions, scanSuggestionsForProject, removeSuggestion } = useProactiveSuggestions();

  useEffect(() => {
    scanSuggestionsForProject({
      timeline: { audioGapsCount: 1, subtitleOverlaysCount: 1 },
    });
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: '12px', padding: '10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#ff9800' }}>
        Proactive Optimizations
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            style={{
              padding: '6px',
              background: '#111',
              borderLeft: '3px solid #ff9800',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, marginRight: '8px' }}>
              <strong style={{ fontSize: '10px', display: 'block', color: '#ccc' }}>
                {sug.type.toUpperCase().replace('_', ' ')}
              </strong>
              <span style={{ fontSize: '10px', color: '#aaa' }}>{sug.description}</span>
            </div>
            <button
              onClick={() => removeSuggestion(sug.id)}
              style={{ padding: '2px 8px', fontSize: '9px', background: '#333', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
            >
              Ignore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProactiveSuggestionsPanel;
