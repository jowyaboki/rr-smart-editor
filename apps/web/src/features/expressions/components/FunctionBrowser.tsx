import React from 'react';

interface FunctionBrowserProps {
  onInsert: (value: string) => void;
}

export const FunctionBrowser: React.FC<FunctionBrowserProps> = ({ onInsert }) => {
  const functions = [
    { name: 'clamp(val, min, max)', insert: 'clamp(val, 0, 100)', desc: 'Clamps value between min and max' },
    { name: 'lerp(start, end, t)', insert: 'lerp(0, 100, t)', desc: 'Linear interpolation from start to end' },
    { name: 'linear(t, tMin, tMax, val1, val2)', insert: 'linear(time, 0, 5, 0, 100)', desc: 'Maps t range to val range' },
    { name: 'ease(t, tMin, tMax, val1, val2)', insert: 'ease(time, 0, 5, 0, 100)', desc: 'Ease-in-out mapping' },
    { name: 'wiggle(freq, amp)', insert: 'wiggle(2, 50)', desc: 'Wiggle values (frequency, amplitude)' },
    { name: 'smooth(values, width)', insert: 'smooth(values, 5)', desc: 'Smoothing moving average filter' },
    { name: 'noise(x, y, z)', insert: 'noise(time)', desc: 'Deterministic 1D/2D/3D pseudo-noise' },
    { name: 'random(min, max)', insert: 'random(0, 10)', desc: 'Deterministic pseudo-random value' },
    { name: 'sin(x)', insert: 'sin(time)', desc: 'Trigonometric sine function' },
    { name: 'cos(x)', insert: 'cos(time)', desc: 'Trigonometric cosine function' },
    { name: 'tan(x)', insert: 'tan(time)', desc: 'Trigonometric tangent function' },
    { name: 'abs(x)', insert: 'abs(x)', desc: 'Absolute value' },
    { name: 'floor(x)', insert: 'floor(x)', desc: 'Round down to nearest integer' },
    { name: 'ceil(x)', insert: 'ceil(x)', desc: 'Round up to nearest integer' },
    { name: 'round(x)', insert: 'round(x)', desc: 'Round to nearest integer' },
    { name: 'min(a, b, ...)', insert: 'min(a, b)', desc: 'Minimum value' },
    { name: 'max(a, b, ...)', insert: 'max(a, b)', desc: 'Maximum value' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '6px',
        padding: '12px',
        color: '#ccc',
      }}
    >
      <h3
        style={{
          margin: '0 0 10px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          borderBottom: '1px solid #333',
          paddingBottom: '6px',
        }}
      >
        Function Browser
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#888' }}>
        Double-click an item below to insert it at your cursor:
      </p>
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {functions.map((fn) => (
          <div
            key={fn.name}
            onDoubleClick={() => onInsert(fn.insert)}
            style={{
              padding: '6px 8px',
              backgroundColor: '#242424',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#242424';
            }}
          >
            <strong style={{ color: '#8bc34a', fontFamily: 'monospace' }}>{fn.name}</strong>
            <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{fn.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
