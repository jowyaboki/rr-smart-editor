import React from 'react';
import { useEffectsStore } from '../store/effectsStore';
import { ColorPicker } from './ColorPicker';
import { CurveEditor } from './CurveEditor';
import { BlendModeSelector } from './BlendModeSelector';
import { MaskControls } from './MaskControls';
import { Effect } from '../types';

export const EffectInspector: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    updateLayerBlendMode,
    updateLayerOpacity,
    addEffectToLayer,
    removeEffectFromLayer,
    updateEffectParameter,
    toggleEffectEnabled,
    addMaskToLayer,
    removeMaskFromLayer,
    updateMaskInLayer,
    undo,
    redo,
  } = useEffectsStore();

  const activeLayer = layers.find((l) => l.id === selectedLayerId);

  const availableEffects = [
    'blur',
    'gaussian_blur',
    'glow',
    'shadow',
    'brightness',
    'contrast',
    'exposure',
    'saturation',
    'hue',
    'tint',
    'curves',
    'levels',
    'color_balance',
    'sharpen',
    'noise',
    'grain',
    'vignette',
    'chromatic_aberration',
    'pixelate',
    'posterize',
    'emboss',
    'edge_detect',
  ];

  if (!activeLayer) {
    return (
      <div style={{ padding: '16px', color: '#888', textAlign: 'center', fontSize: '12px' }}>
        No layer selected. Select a layer to configure visual effects.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', height: '100%', overflowY: 'auto', borderLeft: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Layer: {activeLayer.name}</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={undo} style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Undo</button>
          <button onClick={redo} style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}>Redo</button>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '12px' }}>
        <BlendModeSelector
          value={activeLayer.blendMode}
          onChange={(mode) => updateLayerBlendMode(activeLayer.id, mode)}
        />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#ccc', width: '80px' }}>Opacity:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={activeLayer.opacity}
            onChange={(e) => updateLayerOpacity(activeLayer.id, parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '11px', width: '30px', textAlign: 'right' }}>
            {Math.round(activeLayer.opacity * 100)}%
          </span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '12px' }}>
        <MaskControls
          masks={activeLayer.masks}
          onAddMask={(mask) => addMaskToLayer(activeLayer.id, mask)}
          onRemoveMask={(id) => removeMaskFromLayer(activeLayer.id, id)}
          onUpdateMask={(id, updates) => updateMaskInLayer(activeLayer.id, id, updates)}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Add Effect:</label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              addEffectToLayer(activeLayer.id, e.target.value);
              e.target.value = '';
            }
          }}
          style={{ width: '100%', padding: '4px', background: '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}
        >
          <option value="">Select Effect...</option>
          {availableEffects.map((eff) => (
            <option key={eff} value={eff}>
              {eff.toUpperCase().replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>Applied Effects Chain</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeLayer.effects.effects.map((effect: Effect) => (
            <div key={effect.id} style={{ background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={effect.enabled}
                    onChange={() => toggleEffectEnabled(activeLayer.id, effect.id)}
                  />
                  {effect.name}
                </label>
                <button
                  onClick={() => removeEffectFromLayer(activeLayer.id, effect.id)}
                  style={{ background: '#c62828', color: '#fff', border: 'none', padding: '2px 6px', fontSize: '9px', borderRadius: '2px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.values(effect.parameters).map((param) => (
                  <div key={param.id}>
                    {param.type === 'number' && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#888', width: '80px' }}>{param.name}:</span>
                        <input
                          type="range"
                          min={param.min ?? 0}
                          max={param.max ?? 100}
                          step={param.step ?? 1}
                          value={param.value}
                          onChange={(e) => updateEffectParameter(activeLayer.id, effect.id, param.id, parseFloat(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '10px', width: '30px', textAlign: 'right' }}>{param.value}</span>
                      </div>
                    )}

                    {param.type === 'color' && (
                      <ColorPicker
                        label={param.name}
                        color={param.value}
                        onChange={(col) => updateEffectParameter(activeLayer.id, effect.id, param.id, col)}
                      />
                    )}

                    {param.type === 'curve' && (
                      <CurveEditor
                        points={param.value}
                        onChange={(pts) => updateEffectParameter(activeLayer.id, effect.id, param.id, pts)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
