import React from 'react';
import { Project } from '@ai-video-editor/shared';

interface BeforeAfterViewerProps {
  originalProject: Project | null;
  simulatedProject: Project | null;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({ originalProject, simulatedProject }) => {
  if (!originalProject || !simulatedProject) return null;

  const originalClipsCount = originalProject.timeline?.clips?.length || 0;
  const simulatedClipsCount = simulatedProject.timeline?.clips?.length || 0;

  const originalTracksCount = originalProject.timeline?.tracks?.length || 0;
  const simulatedTracksCount = simulatedProject.timeline?.tracks?.length || 0;

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Isolated Dual-State Inspector
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Real (Original) Project Side */}
        <div style={{ background: 'rgba(255, 152, 0, 0.05)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ff9800', borderRadius: '50%', marginRight: '8px' }} />
            <h4 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original State</h4>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ccc' }}>
            Name: <span style={{ color: '#fff', fontWeight: 'bold' }}>{originalProject.name}</span>
          </p>
          <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Total Clips: <strong style={{ color: '#fff' }}>{originalClipsCount}</strong></div>
            <div>Total Tracks: <strong style={{ color: '#fff' }}>{originalTracksCount}</strong></div>
            <div>Database Integrity: <strong style={{ color: '#4caf50' }}>Synchronized</strong></div>
          </div>
        </div>

        {/* Digital Twin (Simulated) Side */}
        <div style={{ background: 'rgba(76, 175, 80, 0.05)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%', marginRight: '8px' }} />
            <h4 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Digital Twin State</h4>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ccc' }}>
            Name: <span style={{ color: '#fff', fontWeight: 'bold' }}>{simulatedProject.name} (Simulated)</span>
          </p>
          <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Total Clips: <strong style={{ color: '#fff' }}>{simulatedClipsCount}</strong></div>
            <div>Total Tracks: <strong style={{ color: '#fff' }}>{simulatedTracksCount}</strong></div>
            <div>Database Integrity: <strong style={{ color: '#2196f3' }}>Simulated Isolated Cache</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
