import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Chart } from '@ai-video-editor/shared';
import { ChartEngine } from '@/features/charts/engine/ChartEngine';

interface ChartLayerProps {
  chart: Chart;
}

export const ChartLayer: React.FC<ChartLayerProps> = ({ chart }) => {
  const frame = useCurrentFrame();
  const renderData = ChartEngine.prepareRenderData(chart);

  // Basic Bar Chart Implementation for Remotion
  if (chart.type === 'bar') {
    return (
      <AbsoluteFill style={{ padding: chart.padding, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
        {renderData.data.map((d: any, i: number) => {
          const progress = interpolate(frame, [0, chart.animation.durationFrames], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                width: '10%',
                height: `${d.value * progress}%`,
                backgroundColor: chart.theme.colors[i % chart.theme.colors.length],
                borderRadius: '4px 4px 0 0'
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
       <div style={{ color: 'white' }}>Chart (${chart.type}) placeholder</div>
    </AbsoluteFill>
  );
};
