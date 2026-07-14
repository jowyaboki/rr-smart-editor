import { ChartDataset, ChartSeries } from '@ai-video-editor/shared';
import { useDataStore } from '@/features/data/store/dataStore';

export const DatasetResolver = {
  resolveData(dataset: ChartDataset, series: ChartSeries[]): any[] {
    const { sources } = useDataStore.getState();
    const source = sources.find(s => s.id === dataset.sourceId);

    if (!source || !source.data) return [];

    const data = Array.isArray(source.data) ? source.data : [source.data];

    return data.map(row => {
      const entry: any = {};
      series.forEach(s => {
        entry[s.dataKey] = this.getValueByPath(row, dataset.mapping[s.dataKey] || s.dataKey);
      });
      return entry;
    });
  },

  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  }
};
