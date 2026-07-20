import React from 'react';
import { Mask } from '../types';

interface MaskControlsProps {
  masks: Mask[];
  onAddMask: (type: any) => void;
  onRemoveMask: (id: string) => void;
  onUpdateMask: (id: string, updates: Partial<Mask>) => void;
}

export const MaskControls: React.FC<MaskControlsProps> = ({
  masks,
  onAddMask,
  onRemoveMask,
  onUpdateMask,
}) => {
  const addDefaultMask = (type: 'shape' | 'gradient') => {
    const defaultMask: Mask = {
      id: `mask-${Math.random().toString(36).substr(2, 9)}`,
      name: `${type.toUpperCase()} Mask`,
      type,
      enabled: true,
      inverted: false,
      feather: 0,
      expansion: 0,
      points: type === 'shape' ? [{ x: 50, y: 50 }, { x: 150, y: 50 }, { x: 100, y: 150 }] : undefined,
    };
    onAddMask(defaultMask);
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #333', borderRadius: '4px', background: '#1a1a1a', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Masks</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => addDefaultMask('shape')}
            style={{ padding: '2px 6px', fontSize: '10px', background: '#444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
          >
            + Shape
          </button>
          <button
            onClick={() => addDefaultMask('gradient')}
            style={{ padding: '2px 6px', fontSize: '10px', background: '#444', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
          >
            + Gradient
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {masks.map((mask) => (
          <div key={mask.id} style={{ border: '1px solid #333', padding: '6px', borderRadius: '2px', background: '#222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{mask.name}</span>
              <button
                onClick={() => onRemoveMask(mask.id)}
                style={{ padding: '1px 4px', fontSize: '9px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '10px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={mask.enabled}
                    onChange={(e) => onUpdateMask(mask.id, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <label style={{ fontSize: '10px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={mask.inverted}
                    onChange={(e) => onUpdateMask(mask.id, { inverted: e.target.checked })}
                  />
                  Inverted
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#aaa', width: '60px' }}>Feather:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={mask.feather}
                  onChange={(e) => onUpdateMask(mask.id, { feather: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '10px' }}>{mask.feather}px</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#aaa', width: '60px' }}>Expansion:</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={mask.expansion}
                  onChange={(e) => onUpdateMask(mask.id, { expansion: parseInt(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '10px' }}>{mask.expansion}px</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
