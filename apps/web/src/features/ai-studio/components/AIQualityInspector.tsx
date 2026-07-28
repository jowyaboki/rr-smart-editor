import React from 'react';

interface AIQualityInspectorProps {
  warnings: string[];
}

export const AIQualityInspector: React.FC<AIQualityInspectorProps> = ({ warnings }) => {
  return (
    <div style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #222', borderRadius: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Automatic Quality Review Checklist
      </span>
      {warnings.length === 0 ? (
        <div style={{ fontSize: '11px', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ✓ Quality Audit Passed! All elements conform to standard brand kits and overlaps.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {warnings.map((w, idx) => (
            <div key={idx} style={{ fontSize: '10px', color: '#ff9800' }}>
              ⚠ {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AIQualityInspector;
