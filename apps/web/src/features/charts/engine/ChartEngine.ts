import { Chart, ChartDataset, ChartSeries } from '@ai-video-editor/shared';
import { DatasetResolver } from '../services/DatasetResolver';
import { ChartRenderer } from '../services/ChartRenderer';

export const ChartEngine = {
  prepareRenderData(chart: Chart): any {
    const data = DatasetResolver.resolveData(chart.dataset, chart.series);

    // Calculate animation state based on frame would happen here
    // For now, we return the resolved data and basic paths
    const path = ChartRenderer.generatePath(chart, data);

    return {
      data,
      path,
      theme: chart.theme,
      animation: chart.animation
    };
  }
};
