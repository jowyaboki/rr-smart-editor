import React from 'react';
import { useTemplatePreview } from '../hooks/useTemplatePreview';

interface LivePreviewVisualizerProps {
  templateId: string;
}

export const LivePreviewVisualizer: React.FC<LivePreviewVisualizerProps> = ({ templateId }) => {
  const { currentPreviewFrame, triggerLivePreviewUpdate } = useTemplatePreview(templateId);

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Template Blueprint Live Preview</span>
        <button
          onClick={triggerLivePreviewUpdate}
          style={{ padding: '2px 6px', fontSize: '9px', background: '#333', color: '#ccc', border: '1px solid #444', borderRadius: '2px', cursor: 'pointer' }}
        >
          Render
        </button>
      </div>

      <div style={{ background: '#000', padding: '16px', borderRadius: '2px', border: '1px solid #222', minHeight: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: '#888' }}>
        {currentPreviewFrame ? (
          <div style={{ fontStyle: 'italic', wordBreak: 'break-all' }}>
            {currentPreviewFrame}
          </div>
        ) : (
          <span>No preview generated. Click "Render" to compute live blueprint values.</span>
        )}
      </div>
    </div>
  );
};
export default LivePreviewVisualizer;
