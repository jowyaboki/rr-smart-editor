import React from 'react';
import { useMotionComposerStore } from '../store/motionComposerStore';

export const LayerTimeline: React.FC = () => {
  const {
    activeComp,
    selectedLayerId,
    currentTime,
    selectLayer,
    setFrame,
    removeLayer,
  } = useMotionComposerStore();

  if (!activeComp) return null;

  const totalFrames = activeComp.durationFrames || 150;

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '36px 1fr',
      height: '100%',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#e2e8f0',
      backgroundColor: '#121214',
    }}>
      {/* TIMELINE RULER / PLAYHEAD SCRUBBER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        borderBottom: '1px solid #1e1e24',
        alignItems: 'center',
        backgroundColor: '#16161a',
      }}>
        <div style={{ paddingLeft: '16px', fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🎞️ Composition Timeline Layers
        </div>
        <div
          style={{
            position: 'relative',
            height: '100%',
            cursor: 'ew-resize',
            backgroundColor: '#18181b',
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const targetFrame = Math.round(percentage * totalFrames);
            setFrame(Math.min(totalFrames, Math.max(0, targetFrame)));
          }}
        >
          {/* Tick lines spaced nicely */}
          {[0, 25, 50, 75, 100, 125, 150].map((frame) => {
            const leftPct = (frame / totalFrames) * 100;
            return (
              <div
                key={frame}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '9px', color: '#71717a', transform: 'translate(-50%, -10px)', position: 'absolute' }}>
                  {frame}f
                </span>
              </div>
            );
          })}

          {/* Draggable Playhead marker indicator */}
          <div style={{
            position: 'absolute',
            left: `${(currentTime / totalFrames) * 100}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#ef4444',
            zIndex: 10,
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              transform: 'translateX(-5px)',
              cursor: 'pointer',
              border: '2px solid #fff',
            }} />
          </div>
        </div>
      </div>

      {/* LAYERS TRACK RUNNER */}
      <div style={{
        overflowY: 'auto',
        backgroundColor: '#121214',
      }}>
        {activeComp.layers.map((layer) => {
          const isSelected = selectedLayerId === layer.id;
          const leftPct = (layer.startFrame / totalFrames) * 100;
          const widthPct = (layer.duration / totalFrames) * 100;

          return (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                borderBottom: '1px solid #1a1a1e',
                alignItems: 'center',
                height: '40px',
                backgroundColor: isSelected ? '#1e1e24' : 'transparent',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Layer Title/Metadata and controls */}
              <div style={{
                paddingLeft: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRight: '1px solid #1a1a1e',
                height: '100%',
                paddingRight: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#3b82f6' : '#e2e8f0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>
                    {layer.name}
                  </span>
                  <span style={{ fontSize: '10px', color: '#71717a', backgroundColor: '#18181b', padding: '2px 6px', borderRadius: '4px' }}>
                    {layer.type}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayer(layer.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: 0.6,
                    padding: '4px',
                  }}
                  title="Remove Layer"
                >
                  🗑️
                </button>
              </div>

              {/* Graphical Duration Block */}
              <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                <div style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: '24px',
                  backgroundColor: layer.type === 'shape' ? '#10b981' : layer.type === 'camera' ? '#8b5cf6' : '#3b82f6',
                  opacity: isSelected ? 1 : 0.7,
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #ffffff' : 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {layer.name} Duration Block
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
