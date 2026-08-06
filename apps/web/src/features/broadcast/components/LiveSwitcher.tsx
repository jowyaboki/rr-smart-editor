import React from 'react';
import { useBroadcastStore } from '../store/broadcastStore';

export const LiveSwitcher: React.FC = () => {
  const {
    activeScenes,
    switcherState,
    selectPreview,
    cut,
    fade,
    wipe,
    stinger,
  } = useBroadcastStore();

  const previewScene = activeScenes.find(s => s.id === switcherState.previewSceneId);
  const programScene = activeScenes.find(s => s.id === switcherState.programSceneId);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      backgroundColor: '#16161a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #27272a',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        🎚️ Multi-Scene Live Switcher
      </h3>

      {/* DUAL COLD/HOT PROGRAM MONITOR VIEWS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* PREVIEW VIEW */}
        <div style={{
          border: '2px solid #22c55e',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          <div style={{ backgroundColor: '#22c55e', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'flex', justifyContent: 'space-between' }}>
            <span>💚 PREVIEW FEED</span>
            <span>{previewScene?.name || 'No scene selected'}</span>
          </div>
          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '12px', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>👁️</span>
            <span>{previewScene ? `${previewScene.name} (Inputs: ${previewScene.inputs.length})` : 'Black Out'}</span>
          </div>
        </div>

        {/* PROGRAM VIEW */}
        <div style={{
          border: '2px solid #ef4444',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          <div style={{ backgroundColor: '#ef4444', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔴 ON-AIR PROGRAM FEED</span>
            <span>{programScene?.name || 'No scene selected'}</span>
          </div>
          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5', fontSize: '12px', flexDirection: 'column', gap: '8px', animation: switcherState.isTransitioning ? 'pulse 0.5s infinite alternate' : 'none' }}>
            <span style={{ fontSize: '24px' }}>📡</span>
            <span>{programScene ? `${programScene.name} (LIVE)` : 'Off Air'}</span>
          </div>
        </div>
      </div>

      {/* TRANSITION TRIGGERS BAR */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #27272a', paddingTop: '16px' }}>
        <button
          onClick={() => cut()}
          disabled={switcherState.isTransitioning}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: switcherState.isTransitioning ? 0.5 : 1,
          }}
        >
          ⚡ CUT (Instant)
        </button>

        <button
          onClick={() => fade(400)}
          disabled={switcherState.isTransitioning}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: switcherState.isTransitioning ? 0.5 : 1,
          }}
        >
          🎬 FADE (Cross)
        </button>

        <button
          onClick={() => wipe(600)}
          disabled={switcherState.isTransitioning}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: switcherState.isTransitioning ? 0.5 : 1,
          }}
        >
          ↔️ WIPE
        </button>

        <button
          onClick={() => stinger('stinger_game_logo', 1000)}
          disabled={switcherState.isTransitioning}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#eab308',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: switcherState.isTransitioning ? 0.5 : 1,
          }}
        >
          ⭐ STINGER
        </button>
      </div>

      {/* CHOOSE PREVIEW TARGET BUS */}
      <div>
        <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Select Preview Source:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeScenes.map((scene) => {
            const isPreview = switcherState.previewSceneId === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => selectPreview(scene.id)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: isPreview ? '#22c55e20' : '#1e1e24',
                  color: isPreview ? '#22c55e' : '#e2e8f0',
                  border: isPreview ? '1px solid #22c55e' : '1px solid #27272a',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {scene.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
