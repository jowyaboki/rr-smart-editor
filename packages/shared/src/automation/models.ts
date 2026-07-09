import { AutomationStatus, DataConfig, VariableMapping, AutomationProgress } from './types';

export interface AutomationTemplate {
  id: string;
  name: string;
  projectId: string; // The base project/timeline to replicate
  mappings: VariableMapping[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchJob {
  id: string;
  name: string;
  templateId: string;
  dataConfig: DataConfig;
  profile: GenerationProfile;
  status: AutomationStatus;
  progress: AutomationProgress;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface BatchItem {
  id: string;
  batchId: string;
  dataRow: any;
  resolvedVariables: Record<string, any>;
  status: AutomationStatus;
  projectId?: string; // Generated project ID
  renderJobId?: string; // Link to the render job
  outputUrl?: string;
  error?: string;
  duration?: number;
  renderTime?: number;
}

export interface BatchResult {
  batchId: string;
  items: BatchItem[];
  summary: {
    success: number;
    failure: number;
    totalTime: number;
    avgRenderTime: number;
  };
  manifestUrl?: string;
}

export interface GenerationProfile {
  concurrency: number;
  priority: 'low' | 'normal' | 'high';
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
  outputPattern: string; // e.g. "video_{id}_{name}"
}

export interface GenerationContext {
  batchId: string;
  template: AutomationTemplate;
  profile: GenerationProfile;
  globals: Record<string, any>;
}

export interface AutomationPreset {
  id: string;
  name: string;
  dataConfig: DataConfig;
  mappings: VariableMapping[];
  profile: GenerationProfile;
}

export interface AutomationJob {
  id: string;
  type: 'batch' | 'single';
  payload: any;
  status: AutomationStatus;
  result?: any;
}
