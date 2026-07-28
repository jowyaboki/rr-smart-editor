import React from 'react';
import { useTemplateManager } from '../hooks/useTemplateManager';

export const TemplateMarketplace: React.FC = () => {
  const { templates, searchQuery, setSearchQuery, installTemplate } = useTemplateManager();

  const handleInstallMock = (tpl: any) => {
    installTemplate({
      metadata: {
        id: tpl.id,
        name: tpl.id,
        displayName: tpl.displayName,
        description: tpl.description,
        author: 'RR Studio',
        version: tpl.version,
        tags: [tpl.category],
        category: tpl.category,
      },
      parameters: [
        { id: 'title', name: 'Video Title', type: 'text', defaultValue: 'Awesome Title', required: true, group: 'text' },
        { id: 'logo_scale', name: 'Logo Scale', type: 'number', defaultValue: 1.0, required: true, min: 0.1, max: 5.0, step: 0.1, group: 'logo' },
      ],
      sections: [],
      slots: [
        { id: 'title', name: 'Title Slot', targetPath: 'timeline.tracks[0].clips[0].name', type: 'text' }
      ],
      presets: [],
      blueprintProject: { timeline: { tracks: [{ clips: [{ id: 'c-1', name: 'Intro Blueprint' }] }] } },
    });
  };

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px' }}>Template Marketplace</h4>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blueprints..."
          style={{ padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px', width: '150px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {templates.filter(e => !e.installed).map((tpl) => (
          <div key={tpl.id} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tpl.displayName}</span>
              <button
                onClick={() => handleInstallMock(tpl)}
                style={{ padding: '2px 8px', fontSize: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                Download
              </button>
            </div>
            <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#aaa' }}>{tpl.description}</p>
            <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#666' }}>
              <span>Version: {tpl.version}</span>
              <span>★ {tpl.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TemplateMarketplace;
