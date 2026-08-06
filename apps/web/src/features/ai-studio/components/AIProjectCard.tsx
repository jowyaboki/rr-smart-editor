import React from 'react';
import { AIProjectOutput } from '../types';

interface AIProjectCardProps {
  project: AIProjectOutput;
}

export const AIProjectCard: React.FC<AIProjectCardProps> = ({ project }) => {
  return (
    <div style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1976d2' }}>{project.name}</span>
        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#333', borderRadius: '2px' }}>
          Duration: {project.script.brief.durationSeconds}s
        </span>
      </div>
      <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#aaa' }}>
        Style: {project.script.brief.style} | Tone: {project.script.brief.tone}
      </p>
    </div>
  );
};
export default AIProjectCard;
