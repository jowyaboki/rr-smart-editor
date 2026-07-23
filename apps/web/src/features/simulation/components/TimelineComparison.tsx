import React from 'react';
import { Project } from '@ai-video-editor/shared';
import { webReplayService } from '../services';

interface TimelineComparisonProps {
  originalProject: Project | null;
  simulatedProject: Project | null;
}

export const TimelineComparison: React.FC<TimelineComparisonProps> = ({ originalProject, simulatedProject }) => {
  if (!originalProject || !simulatedProject) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
        Requires both original and simulated projects to render a timeline comparison.
      </div>
    );
  }

  const origTimeline = originalProject.timeline || { clips: [], tracks: [] };
  const simTimeline = simulatedProject.timeline || { clips: [], tracks: [] };

  const diff = webReplayService.getTimelineDiff(origTimeline, simTimeline);

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff', border: '1px solid #333', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Virtual Timeline Compares (Diff Log)
      </h3>

      {diff.addedClips.length === 0 && diff.removedClips.length === 0 && diff.modifiedClips.length === 0 ? (
        <div style={{ padding: '12px', background: '#252526', borderRadius: '4px', textAlign: 'center', fontSize: '13px', color: '#888' }}>
          No discrepancies detected. Original and Simulated timelines match.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
          {diff.addedClips.map((clip: any) => (
            <div key={clip.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4caf50', borderRadius: '4px', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '6px' }}>[ADDED CLIP]</span>
                {clip.name} (on track {clip.trackId})
              </div>
              <div style={{ color: '#aaa' }}>{clip.duration} frames</div>
            </div>
          ))}

          {diff.removedClips.map((clip: any) => (
            <div key={clip.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(244, 67, 54, 0.1)', borderLeft: '4px solid #f44336', borderRadius: '4px', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '6px' }}>[REMOVED CLIP]</span>
                {clip.name}
              </div>
              <div style={{ color: '#aaa' }}>{clip.duration} frames</div>
            </div>
          ))}

          {diff.modifiedClips.map((mod: any, i: number) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', background: 'rgba(33, 150, 243, 0.1)', borderLeft: '4px solid #2196f3', borderRadius: '4px', fontSize: '13px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                [MODIFIED CLIP] ID: {mod.id}
              </div>
              <div style={{ color: '#ccc' }}>
                Field <code style={{ color: '#fff', background: '#252526', padding: '2px 4px', borderRadius: '2px' }}>{mod.field}</code> changed from{' '}
                <span style={{ textDecoration: 'line-through', color: '#ff9800', marginRight: '4px' }}>{JSON.stringify(mod.before)}</span>
                to <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{JSON.stringify(mod.after)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
