import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label = 'Color' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
      <span style={{ fontSize: '11px', color: '#ccc', width: '80px' }}>{label}:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: 'none', border: 'none', width: '30px', height: '24px', cursor: 'pointer' }}
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '70px',
          background: '#222',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '2px',
          fontSize: '11px',
          padding: '2px 4px',
          textAlign: 'center',
        }}
      />
    </div>
  );
};
