import React from 'react';
import { useBroadcastStore } from '../store/broadcastStore';

export const StreamConfig: React.FC = () => {
  const {
    streamingDestinations,
    recordingSession,
    startStreaming,
    stopStreaming,
    startRecording,
    stopRecording,
  } = useBroadcastStore();

  const isRecording = recordingSession?.status === 'recording';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#16161a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #27272a',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
        ⚙️ Destined Output & Recording Config
      </h3>

      {/* STREAMING DESTINATIONS CONTAINER */}
      <div>
        <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Broadcasting Servers:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {streamingDestinations.map((dest) => {
            const isStreaming = dest.status === 'streaming';
            return (
              <div
                key={dest.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#1e1e24',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #27272a',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#e2e8f0', display: 'block' }}>
                    {dest.name} ({dest.protocol.toUpperCase()})
                  </span>
                  <span style={{ fontSize: '10px', color: '#71717a' }}>
                    Endpoint: {dest.streamUrl}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (isStreaming) {
                      stopStreaming(dest.id);
                    } else {
                      startStreaming(dest.id);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isStreaming ? '#ef444420' : '#10b98120',
                    color: isStreaming ? '#ef4444' : '#10b981',
                    border: isStreaming ? '1px solid #ef4444' : '1px solid #10b981',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isStreaming ? 'Disconnect' : 'Connect Stream'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOCAL HD RECORDING RIG */}
      <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', display: 'block' }}>
              🎥 Local Segment Recording
            </span>
            <span style={{ fontSize: '10px', color: '#71717a' }}>
              Bitrate: 8000 Kbps | Format: MP4
            </span>
          </div>

          <button
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {isRecording && (
          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#ef444410', borderRadius: '4px', border: '1px solid #ef444420', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#fca5a5' }}>● RECORDING IN PROGRESS</span>
            <span style={{ color: '#fca5a5' }}>
              Size: {recordingSession?.fileSizeMb.toFixed(2)} MB | {recordingSession?.durationSeconds}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
