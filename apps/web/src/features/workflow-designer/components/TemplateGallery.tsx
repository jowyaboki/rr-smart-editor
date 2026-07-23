import React from 'react';
import { listWorkflowTemplates } from '../templates';

export const TemplateGallery: React.FC = () => {
  const templates = listWorkflowTemplates();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Workflow Templates Library
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {templates.map((tpl) => (
          <div key={tpl.id} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '3px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1976d2' }}>{tpl.name}</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#aaa' }}>{tpl.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TemplateGallery;
