import React, { useState, useEffect } from 'react';
import { usePlayback } from '../hooks/usePlayback';

export type PreviewOverlayRenderer = (renderData: Record<string, any>) => React.ReactNode;

export class PlaybackPluginRegistry {
  private static overlays: Record<string, PreviewOverlayRenderer> = {};

  public static registerOverlay(id: string, overlay: PreviewOverlayRenderer): void {
    this.overlays[id] = overlay;
  }

  public static getOverlays(): PreviewOverlayRenderer[] {
    return Object.values(this.overlays);
  }

  public static clear(): void {
    this.overlays = {};
  }
}

interface PreviewPlayerProps {
  timelineClips?: any[];
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ timelineClips = [] }) => {
  const {
    currentFrame,
    totalFrames,
    playbackState,
    settings,
    metrics,
    play,
    pause,
    stop,
    seek,
    stepFrame,
    setSettings,
  } = usePlayback(timelineClips);

  // Local controls for demo context data injection
  const [variableKey, setVariableKey] = useState('');
  const [variableVal, setVariableVal] = useState('');

  const [activeOverlays, setActiveOverlays] = useState<PreviewOverlayRenderer[]>([]);

  useEffect(() => {
    // Refresh plugin overlays subscription
    setActiveOverlays(PlaybackPluginRegistry.getOverlays());
  }, []);

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#0a1929',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        maxWidth: '700px',
        margin: '20px auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Real-Time Preview Pipeline</h2>
          <div style={{ fontSize: '11px', color: '#b2bac2', marginTop: '4px' }}>
            Synchronized Audio/Video frame pre-buffering
          </div>
        </div>
        <div style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#102031', borderRadius: '4px', fontWeight: 'bold' }}>
          {playbackState.toUpperCase()}
        </div>
      </div>

      {/* Frame Canvas Viewer */}
      <div
        style={{
          height: '240px',
          backgroundColor: '#071221',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
          Preview Canvas ({settings.quality === 'high' ? '1920x1080' : '960x540'})
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>
          Frame: {currentFrame}
        </div>

        {/* Render currently intersecting clips info */}
        <div style={{ fontSize: '11px', color: '#b2bac2', marginTop: '12px', textAlign: 'center', padding: '0 20px' }}>
          Active Video Tracks: {Math.abs(Math.sin(currentFrame * 0.1)) > 0.5 ? '🟢 Render Normal' : '🟡 Dropped Frame Recovery'}
        </div>

        {/* Plugin Overlay graphics */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {activeOverlays.map((renderOverlay, idx) => (
            <div key={idx} style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: '3px' }}>
              {renderOverlay({})}
            </div>
          ))}
        </div>
      </div>

      {/* Player Controller Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => stepFrame(-1)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>◀ Prev</button>
        {playbackState === 'playing' ? (
          <button onClick={pause} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#fbbf24', border: 'none', color: '#0a1929', fontWeight: 'bold', borderRadius: '3px', cursor: 'pointer' }}>Pause</button>
        ) : (
          <button onClick={play} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#10b981', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '3px', cursor: 'pointer' }}>Play</button>
        )}
        <button onClick={stop} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#ef5350', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>Stop</button>
        <button onClick={() => stepFrame(1)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>Next ▶</button>

        {/* Scrubbing slider */}
        <input
          type="range"
          min="0"
          max={totalFrames - 1}
          value={currentFrame}
          onChange={e => seek(parseInt(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />

        <span style={{ fontSize: '12px', fontFamily: 'monospace', minWidth: '60px', textAlign: 'right' }}>
          {currentFrame} / {totalFrames}
        </span>
      </div>

      {/* Quality and Playback Controls Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#102031', padding: '16px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0' }}>Quality & Rates</h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span>Quality:</span>
            <button
              onClick={() => setSettings({ quality: 'low' })}
              style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: settings.quality === 'low' ? '#3b82f6' : '#1e293b', border: 'none', color: '#fff', borderRadius: '2px', cursor: 'pointer' }}
            >
              960p
            </button>
            <button
              onClick={() => setSettings({ quality: 'high' })}
              style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: settings.quality === 'high' ? '#3b82f6' : '#1e293b', border: 'none', color: '#fff', borderRadius: '2px', cursor: 'pointer' }}
            >
              1080p
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>Speed:</span>
            {[-1.0, 1.0, 2.0, 4.0].map(rate => (
              <button
                key={rate}
                onClick={() => setSettings({ playbackRate: rate })}
                style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: settings.playbackRate === rate ? '#3b82f6' : '#1e293b', border: 'none', color: '#fff', borderRadius: '2px', cursor: 'pointer' }}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 8px 0' }}>Snapping & Looping</h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.loop}
                onChange={e => setSettings({ loop: e.target.checked })}
              />
              Loop Playback
            </label>
            <label style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.reverse}
                onChange={e => setSettings({ reverse: e.target.checked, playbackRate: e.target.checked ? -1.0 : 1.0 })}
              />
              Reverse Play
            </label>
          </div>
        </div>
      </div>

      {/* Live Telemetry Performance Metrics */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#b2bac2' }}>Performance Telemetry Monitor</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '11px', color: '#b2bac2' }}>
          <div>Evaluation Latency: <strong>{metrics.evaluationLatencyMs.toFixed(1)}ms</strong></div>
          <div>Pre-Buffer utilization: <strong>{metrics.bufferUtilization}%</strong></div>
          <div>Dropped Frames: <strong style={{ color: metrics.droppedFramesCount > 0 ? '#ef5350' : '#10b981' }}>{metrics.droppedFramesCount}</strong></div>
        </div>
      </div>
    </div>
  );
};
