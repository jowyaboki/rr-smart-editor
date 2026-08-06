import React from 'react';
import { useBroadcastStore } from '../store/broadcastStore';

export const ReplayPanel: React.FC = () => {
  const { savedReplays, isReplayBufferActive, startReplayBuffer, stopReplayBuffer, captureReplay } =
    useBroadcastStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#16161a',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #27272a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#f8fafc',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔄 Slow-Motion Replay Center
      </h3>

      {/* REPLAY BUFFER POWER CONTROL */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#1e1e24',
          padding: '12px',
          borderRadius: '6px',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', display: 'block' }}>
            Replay Ring Buffer
          </span>
          <span style={{ fontSize: '10px', color: '#71717a' }}>
            Buffers active video frame inputs in memory
          </span>
        </div>
        <button
          onClick={() => {
            if (isReplayBufferActive) {
              stopReplayBuffer();
            } else {
              startReplayBuffer();
            }
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: isReplayBufferActive ? '#ef4444' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isReplayBufferActive ? 'Stop Buffer' : 'Start Buffer'}
        </button>
      </div>

      {/* SNAPSHOT QUICK TRIGGERS */}
      {isReplayBufferActive && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => captureReplay(5, '5-Second Highlight')}
            style={{
              padding: '10px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⭐ Clip Last 5s
          </button>
          <button
            onClick={() => captureReplay(10, '10-Second Playmaker')}
            style={{
              padding: '10px',
              backgroundColor: '#a78bfa',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔥 Clip Last 10s
          </button>
        </div>
      )}

      {/* REPLAYS REPERTOIRE */}
      <div>
        <span
          style={{
            fontSize: '11px',
            color: '#a1a1aa',
            fontWeight: 600,
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          Captured Replays ({savedReplays.length}):
        </span>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {savedReplays.map((rep) => (
            <div
              key={rep.id}
              style={{
                backgroundColor: '#1e1e24',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #27272a',
              }}
            >
              <div>
                <strong style={{ color: '#e2e8f0', display: 'block' }}>{rep.name}</strong>
                <span style={{ color: '#71717a' }}>
                  Duration: {rep.durationMs / 1000}s @ {rep.playbackSpeed * 100}% speed
                </span>
                <span
                  style={{
                    color: '#a1a1aa',
                    display: 'block',
                    marginTop: '2px',
                    fontStyle: 'italic',
                  }}
                >
                  Note: {rep.markerNotes}
                </span>
              </div>
              <span style={{ fontSize: '14px' }}>{'★'.repeat(rep.rating || 5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
