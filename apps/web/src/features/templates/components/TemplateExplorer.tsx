import React from 'react';
import { useTemplateManager } from '../hooks/useTemplateManager';

export const TemplateExplorer: React.FC = () => {
  const { templates, toggleFavorite } = useTemplateManager();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        Local Templates Catalog
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {templates.filter(e => e.installed).length === 0 && (
          <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', padding: '12px 0' }}>
            No templates installed offline.
          </div>
        )}
        {templates.filter(e => e.installed).map((tpl) => (
          <div key={tpl.id} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tpl.displayName}</span>
              <button
                onClick={() => toggleFavorite(tpl.id)}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  background: tpl.isFavorite ? '#f57c00' : '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                {tpl.isFavorite ? '★ Favorite' : '☆ Favorite'}
              </button>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#aaa' }}>{tpl.description}</p>
            <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#666' }}>
              <span>Version: {tpl.version}</span>
              <span>Category: {tpl.category.toUpperCase().replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TemplateExplorer;
