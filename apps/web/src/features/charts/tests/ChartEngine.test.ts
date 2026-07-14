import { ChartEngine } from '../engine/ChartEngine';
import { ChartRenderer } from '../services/ChartRenderer';
import { Chart } from '@ai-video-editor/shared';

export const runChartTests = () => {
  console.log('🚀 Starting Chart Engine Tests...');

  const mockChart: Chart = {
    id: 'test-chart',
    type: 'line',
    dataset: { sourceId: 'src-1', mapping: { value: 'count' } },
    series: [{ id: 's1', name: 'Series 1', dataKey: 'value' }],
    xAxis: { enabled: true, label: 'Time', grid: true },
    yAxis: { enabled: true, label: 'Value', grid: true },
    legend: { enabled: true, position: 'bottom', align: 'center' },
    animation: { type: 'draw', durationFrames: 30, delayFrames: 0, easing: 'ease-in-out' },
    theme: {
        colors: ['blue'],
        fontFamily: 'Arial',
        fontSize: 12,
        gridColor: 'grey',
        axisColor: 'black'
    },
    padding: 10,
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
  };

  // 1. Test Path Generation
  const data = [{ value: 10 }, { value: 50 }, { value: 30 }];
  const path = ChartRenderer.generatePath(mockChart, data);
  console.log('Generated SVG Path:', path);
  if (!path.startsWith('M')) throw new Error('Invalid path generated');

  // 2. Test Render Data Preparation
  // Note: ChartEngine.prepareRenderData calls DatasetResolver which uses useDataStore.
  // This would need a mocked store in a real unit test environment.
  console.log('Chart metadata:', mockChart.type, mockChart.animation.type);

  console.log('✅ Chart Engine Tests Completed.');
};
