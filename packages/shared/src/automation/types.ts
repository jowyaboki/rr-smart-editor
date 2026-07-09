export type AutomationStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';

export type DataSourceType = 'json' | 'csv' | 'rest_api' | 'static' | 'google_sheets' | 'database';

export interface DataConfig {
  type: DataSourceType;
  url?: string;
  query?: string;
  staticData?: any;
  options?: Record<string, any>;
}

export interface VariableMapping {
  key: string;
  path: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'color' | 'number' | 'date' | 'conditional';
  defaultValue?: any;
}

export interface AutomationProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
  percent: number;
  eta?: number; // seconds
  startTime?: string;
  endTime?: string;
}
