import React from 'react';
import { useCompositorStore } from '../store/compositorStore';

export const SplitPreview: React.FC = () => {
  const { viewMode, splitRatio, setSplitRatio } = useCompositorStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#16161a',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #27272a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '13px', margin: 0, fontWeight: 600, color: '#f8fafc' }}>
          📺 Split-Compare Video Output
        </h4>
        <span
          style={{
            fontSize: '10px',
            background: '#3b82f620',
            color: '#3b82f6',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          Mode: {viewMode.toUpperCase()}
        </span>
      </div>

      {/* RENDER SPLIT CANVAS MONITOR */}
      <div
        style={{
          width: '100%',
          height: '160px',
          backgroundColor: '#000000',
          borderRadius: '6px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #27272a',
        }}
      >
        {viewMode === 'preview' ? (
          <div style={{ textAlign: 'center', color: '#10b981', fontSize: '11px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🟢</div>
            <div>[Composited Green Screen Chroma Key Output Plate]</div>
          </div>
        ) : viewMode === 'split' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `${splitRatio * 100}% ${(1 - splitRatio) * 100}%`,
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                backgroundColor: '#252529',
                borderRight: '1px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#888',
              }}
            >
              RAW SOURCE (A)
            </div>
            <div
              style={{
                backgroundColor: '#101015',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#10b981',
              }}
            >
              KEYED PLATE (B)
            </div>
          </div>
        ) : viewMode === 'diff' ? (
          <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '11px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🟧</div>
            <div>[Difference highlighting raw green screen vs alpha mask]</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '11px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔥</div>
            <div>[Heatmap: Keyer evaluation took 45ms (Hot Spot)]</div>
          </div>
        )}
      </div>

      {/* SLIDER FOR SPLIT RATIO */}
      {viewMode === 'split' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', color: '#a1a1aa' }}>A-Side</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={splitRatio}
            onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'ew-resize' }}
          />
          <span style={{ fontSize: '10px', color: '#a1a1aa' }}>B-Side</span>
        </div>
      )}
    </div>
  );
};
