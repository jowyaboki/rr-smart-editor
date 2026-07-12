export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'gauge'
  | 'timeline';

export interface ChartAxis {
  enabled: boolean;
  label: string;
  grid: boolean;
  min?: number;
  max?: number;
  format?: string;
}

export interface ChartLegend {
  enabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface ChartSeries {
  id: string;
  name: string;
  color?: string;
  dataKey: string;
}

export interface ChartDataset {
  sourceId: string; // References a DataSource from the Data Engine
  mapping: Record<string, string>; // Maps chart keys to data fields
}

export interface ChartTheme {
  colors: string[];
  fontFamily: string;
  fontSize: number;
  gridColor: string;
  axisColor: string;
}

export interface ChartAnimation {
  type: 'reveal' | 'growth' | 'draw' | 'sweep';
  durationFrames: number;
  delayFrames: number;
  easing: string;
}

export interface Chart {
  id: string;
  type: ChartType;
  dataset: ChartDataset;
  series: ChartSeries[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  legend: ChartLegend;
  animation: ChartAnimation;
  theme: ChartTheme;
  padding: number;
  margins: { top: number; right: number; bottom: number; left: number };
}
