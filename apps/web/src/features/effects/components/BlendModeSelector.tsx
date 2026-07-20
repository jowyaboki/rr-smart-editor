import React from 'react';
import { BlendMode } from '../types';

interface BlendModeSelectorProps {
  value: BlendMode;
  onChange: (mode: BlendMode) => void;
}

export const BlendModeSelector: React.FC<BlendModeSelectorProps> = ({ value, onChange }) => {
  const blendModes: BlendMode[] = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'soft_light',
    'hard_light',
    'darken',
    'lighten',
    'difference',
    'exclusion',
    'color_dodge',
    'color_burn',
    'linear_dodge',
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
      <span style={{ fontSize: '11px', color: '#ccc', width: '80px' }}>Blend Mode:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BlendMode)}
        style={{
          flex: 1,
          background: '#222',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '2px',
          padding: '2px 4px',
          fontSize: '11px',
          cursor: 'pointer',
        }}
      >
        {blendModes.map((mode) => (
          <option key={mode} value={mode}>
            {mode.toUpperCase().replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};
