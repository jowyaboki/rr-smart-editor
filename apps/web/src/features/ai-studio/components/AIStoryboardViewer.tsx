import React from 'react';
import { StoryboardScene } from '../types';

interface AIStoryboardViewerProps {
  storyboard: StoryboardScene[];
}

export const AIStoryboardViewer: React.FC<AIStoryboardViewerProps> = ({ storyboard }) => {
  return (
    <div style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Storyboard Scenes & Dialogue
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {storyboard.map((scene, idx) => (
          <div key={scene.id} style={{ display: 'flex', gap: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
            <div style={{ width: '80px', height: '45px', background: '#333', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '9px', color: '#666' }}>
              Scene {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ccc' }}>Dialogue / Subtitle:</div>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
                "{scene.subtitle}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AIStoryboardViewer;
