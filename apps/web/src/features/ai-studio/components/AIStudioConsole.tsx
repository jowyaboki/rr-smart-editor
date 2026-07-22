import React, { useState } from 'react';
import { useAIStudio } from '../hooks/useAIStudio';
import { AIProjectCard } from './AIProjectCard';
import { AIStoryboardViewer } from './AIStoryboardViewer';
import { AIQualityInspector } from './AIQualityInspector';
import { AIPromptTemplates } from './AIPromptTemplates';

export const AIStudioConsole: React.FC = () => {
  const { project, progress, stage, isGenerating, warnings, generateProjectFromPrompt, clearStudio } = useAIStudio();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    generateProjectFromPrompt(prompt);
  };

  return (
    <div style={{ padding: '16px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', maxWidth: '650px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>AI Video Studio Dashboard</h3>
        {project && (
          <button
            onClick={clearStudio}
            style={{ padding: '3px 10px', fontSize: '11px', background: '#333', color: '#ccc', border: '1px solid #444', borderRadius: '3px', cursor: 'pointer' }}
          >
            Reset
          </button>
        )}
      </div>

      {!project ? (
        <div>
          <AIPromptTemplates onSelect={setPrompt} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video project (e.g., A 15-second promo for a smart editing tool)..."
              style={{ flex: 1, padding: '8px 12px', fontSize: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '3px' }}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ padding: '8px 16px', fontSize: '12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isGenerating ? 'Generating...' : 'Create Project'}
            </button>
          </div>

          {isGenerating && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: '#aaa' }}>
                <span>Stage: {stage}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#1976d2', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AIProjectCard project={project} />
          <AIStoryboardViewer storyboard={project.storyboard} />
          <AIQualityInspector warnings={warnings} />
        </div>
      )}
    </div>
  );
};
export default AIStudioConsole;
