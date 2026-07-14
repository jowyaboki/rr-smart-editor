export type DataSourceType = 'json' | 'csv' | 'static' | 'rest' | 'mock' | 'gsheets' | 'postgresql' | 'airtable' | 'notion';

export interface DataField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

export interface DataSchema {
  fields: DataField[];
}

export interface DataConnection {
  id: string;
  type: DataSourceType;
  config: Record<string, any>;
  status: 'connected' | 'error' | 'disconnected';
}

export interface DataSource {
  id: string;
  connectionId: string;
  name: string;
  schema: DataSchema;
  lastRefresh?: string;
}

export interface DataBinding {
  id: string;
  targetId: string; // ID of the clip, property, or variable
  expression: string; // The data expression
  sourceId: string;
}

export interface DataContext {
  [key: string]: any;
}
