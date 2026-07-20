import React from 'react';

export const AnnotationCanvas: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '120px', background: '#000', border: '1px solid #222', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '11px', color: '#555' }}>
        Canvas Overlaid Drawing Annotations (Highlighters, arrows)
      </div>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {/* Draw a mock highlight vector loop */}
        <circle cx="50" cy="50" r="10" stroke="#f44336" strokeWidth="2" fill="none" />
        <line x1="50" y1="50" x2="100" y2="80" stroke="#f44336" strokeWidth="2" />
      </svg>
    </div>
  );
};
export default AnnotationCanvas;
