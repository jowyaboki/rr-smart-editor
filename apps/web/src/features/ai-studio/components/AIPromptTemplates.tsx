import React from 'react';

interface AIPromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

export const AIPromptTemplates: React.FC<AIPromptTemplatesProps> = ({ onSelect }) => {
  const templates = [
    {
      title: 'TikTok Brand Showcase',
      prompt: 'A vibrant 15-second TikTok brand showcase video promo with flat vector graphics, camera slides, and quick transitions.',
    },
    {
      title: 'YouTube Tech Explainer',
      prompt: 'A 1-minute educational tech explainer video on how non-destructive video timeline editors composite effects.',
    },
    {
      title: 'Short Cinematic Intro',
      prompt: 'A short 5-second cinematic intro with smooth fade-in motion animations and overlay title templates.',
    }
  ];

  return (
    <div>
      <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
        Select Video Prompt Template:
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {templates.map((tpl, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(tpl.prompt)}
            style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '3px', cursor: 'pointer', hover: { background: '#222' } }}
          >
            <strong style={{ fontSize: '11px', display: 'block', color: '#1976d2' }}>{tpl.title}</strong>
            <span style={{ fontSize: '10px', color: '#aaa' }}>{tpl.prompt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AIPromptTemplates;
