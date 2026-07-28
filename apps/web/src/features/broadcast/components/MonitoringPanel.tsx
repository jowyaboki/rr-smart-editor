import React, { useEffect } from 'react';
import { useBroadcastStore } from '../store/broadcastStore';

export const MonitoringPanel: React.FC = () => {
  const { performanceMetrics, updateMetrics } = useBroadcastStore();

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate live fluctuating stream performance metrics
      updateMetrics({
        bitrateKbps: Math.floor(7500 + Math.random() * 800),
        cpuPercent: Math.floor(12 + Math.random() * 6),
        gpuPercent: Math.floor(20 + Math.random() * 5),
        latencyMs: Math.floor(10 + Math.random() * 4),
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [updateMetrics]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#16161a',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #27272a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
        📊 Real-Time Broadcast Telemetry
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {/* FPS */}
        <div
          style={{
            backgroundColor: '#1e1e24',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#71717a',
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Frame Rate
          </span>
          <strong
            style={{ fontSize: '18px', color: '#10b981', display: 'block', marginTop: '4px' }}
          >
            {performanceMetrics.fps} FPS
          </strong>
        </div>

        {/* DROPPED FRAMES */}
        <div
          style={{
            backgroundColor: '#1e1e24',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#71717a',
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Dropped Frames
          </span>
          <strong
            style={{
              fontSize: '18px',
              color: performanceMetrics.droppedFrames > 0 ? '#ef4444' : '#e2e8f0',
              display: 'block',
              marginTop: '4px',
            }}
          >
            {performanceMetrics.droppedFrames}
          </strong>
        </div>

        {/* BITRATE */}
        <div
          style={{
            backgroundColor: '#1e1e24',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#71717a',
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Video Bitrate
          </span>
          <strong
            style={{ fontSize: '18px', color: '#3b82f6', display: 'block', marginTop: '4px' }}
          >
            {(performanceMetrics.bitrateKbps / 1000).toFixed(1)} Mbps
          </strong>
        </div>

        {/* LATENCY */}
        <div
          style={{
            backgroundColor: '#1e1e24',
            padding: '10px',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#71717a',
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Glasston Latency
          </span>
          <strong
            style={{ fontSize: '18px', color: '#8b5cf6', display: 'block', marginTop: '4px' }}
          >
            {performanceMetrics.latencyMs} ms
          </strong>
        </div>
      </div>

      {/* RESOURCE GRAPHS/BARS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid #27272a',
          paddingTop: '12px',
        }}
      >
        {/* CPU */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: '#a1a1aa' }}>CPU Utilization</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              {performanceMetrics.cpuPercent}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: '#27272a',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${performanceMetrics.cpuPercent}%`,
                height: '100%',
                backgroundColor: '#10b981',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>

        {/* GPU */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: '#a1a1aa' }}>GPU Graphics Accelerator</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              {performanceMetrics.gpuPercent}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: '#27272a',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${performanceMetrics.gpuPercent}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>

        {/* MEMORY */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: '#a1a1aa' }}>Memory (RAM) footprint</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>
              {performanceMetrics.memoryMb} MB
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: '#27272a',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(performanceMetrics.memoryMb / 4096) * 100}%`,
                height: '100%',
                backgroundColor: '#8b5cf6',
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
