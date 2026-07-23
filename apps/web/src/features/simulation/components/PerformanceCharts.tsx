import React from 'react';
import { Prediction } from '@ai-video-editor/simulation-engine';

interface PerformanceChartsProps {
  prediction: Prediction | null;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
        No performance telemetry data available. Start an operation to generate predictions.
      </div>
    );
  }

  const { performance } = prediction;

  const renderMeter = (label: string, value: number, unit: string, color: string) => {
    const percentage = Math.min(100, Math.max(0, value));
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 'bold' }}>{value.toFixed(0)}{unit}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Performance Telemetry Predictions
      </h3>

      {renderMeter('CPU Utilization', performance.cpuUsagePercent, '%', '#4caf50')}
      {renderMeter('GPU Utilization', performance.gpuUsagePercent, '%', '#2196f3')}
      {renderMeter('Memory Allocation', (performance.memoryUsageMb / 1024) * 10, '%', '#ff9800')}

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: '#252526', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Estimated Render Duration</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
            {(performance.renderDurationMs / 1000).toFixed(1)}s
          </div>
        </div>
        <div style={{ background: '#252526', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Storage Footprint Growth</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
            {performance.storageGrowthMb.toFixed(1)} MB
          </div>
        </div>
      </div>
    </div>
  );
};
