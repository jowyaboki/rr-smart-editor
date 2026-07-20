import React from 'react';
import { CurvePoint } from '../types';

interface CurveEditorProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
}

export const CurveEditor: React.FC<CurveEditorProps> = ({ points, onChange }) => {
  const addPoint = () => {
    const newPoint = { x: 0.5, y: 0.5 };
    onChange([...points, newPoint].sort((a, b) => a.x - b.x));
  };

  const handlePointChange = (idx: number, field: 'x' | 'y', val: number) => {
    const updated = points.map((p, i) =>
      i === idx ? { ...p, [field]: Math.min(1, Math.max(0, val)) } : p
    );
    onChange(updated);
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #444', borderRadius: '4px', background: '#222' }}>
      <div style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>Curve Editor</div>
      <div style={{ position: 'relative', height: '120px', background: '#111', border: '1px solid #333', marginBottom: '8px' }}>
        <svg width="100%" height="100%" style={{ pointerEvents: 'none' }}>
          <path
            d={`M 0,120 ${points.map(p => `L ${p.x * 150},${120 - p.y * 120}`).join(' ')} L 150,0`}
            fill="none"
            stroke="#888"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {points.map((p, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#888' }}>P{idx}:</span>
            <label style={{ fontSize: '10px' }}>X</label>
            <input
              type="number"
              value={p.x}
              step="0.05"
              onChange={(e) => handlePointChange(idx, 'x', parseFloat(e.target.value))}
              style={{ width: '50px', background: '#333', color: '#fff', border: '1px solid #444', fontSize: '10px' }}
            />
            <label style={{ fontSize: '10px' }}>Y</label>
            <input
              type="number"
              value={p.y}
              step="0.05"
              onChange={(e) => handlePointChange(idx, 'y', parseFloat(e.target.value))}
              style={{ width: '50px', background: '#333', color: '#fff', border: '1px solid #444', fontSize: '10px' }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={addPoint}
        style={{ marginTop: '8px', padding: '4px 8px', fontSize: '10px', background: '#555', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
      >
        + Add Point
      </button>
    </div>
  );
};
