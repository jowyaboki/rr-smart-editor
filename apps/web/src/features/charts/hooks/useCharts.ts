import { useChartStore } from '../store/chartStore';
import { ChartThemeService } from '../services/ChartThemeService';
import { Chart } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const useCharts = (clipId?: string) => {
  const store = useChartStore();
  const chart = clipId ? store.charts[clipId] : null;

  const createChart = (type: any) => {
    if (!clipId) return;
    const newChart: Chart = {
      id: uuidv4(),
      type,
      dataset: { sourceId: '', mapping: {} },
      series: [],
      xAxis: { enabled: true, label: 'X Axis', grid: true },
      yAxis: { enabled: true, label: 'Y Axis', grid: true },
      legend: { enabled: true, position: 'bottom', align: 'center' },
      animation: { type: 'growth', durationFrames: 30, delayFrames: 0, easing: 'ease-out' },
      theme: ChartThemeService.getDefaultTheme(),
      padding: 20,
      margins: { top: 20, right: 20, bottom: 40, left: 40 }
    };
    store.setChart(clipId, newChart);
    return newChart;
  };

  return {
    chart,
    createChart,
    updateChart: store.updateChart,
    removeChart: store.removeChart
  };
};
