import React from 'react';
import { Prediction } from '@ai-video-editor/simulation-engine';

interface ResourceGraphsProps {
  prediction: Prediction | null;
}

export const ResourceGraphs: React.FC<ResourceGraphsProps> = ({ prediction }) => {
  if (!prediction) return null;

  const { cost } = prediction;

  const costItems = [
    { label: 'AI LLM API Tokens', value: cost.aiTokenCost, color: '#9c27b0' },
    { label: 'Video Rendering GPU Computing', value: cost.renderCost, color: '#e91e63' },
    { label: 'High-Res Storage Hosting', value: cost.storageCost, color: '#ff5722' },
  ];

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff', border: '1px solid #333' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Simulation Cost Estimates
      </h3>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Projected Cost</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e91e63', marginTop: '6px' }}>
          ${cost.totalCost.toFixed(4)} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#aaa' }}>{cost.currency}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {costItems.map((item, index) => {
          const ratio = cost.totalCost > 0 ? (item.value / cost.totalCost) * 100 : 0;
          return (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: item.color, marginRight: '8px' }} />
                  {item.label}
                </span>
                <span style={{ fontWeight: 'bold' }}>${item.value.toFixed(4)} ({ratio.toFixed(0)}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${ratio}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
