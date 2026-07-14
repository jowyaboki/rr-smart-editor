export type WorkflowStage =
  | 'project'
  | 'media'
  | 'timeline'
  | 'animation'
  | 'preview'
  | 'validation'
  | 'rendering'
  | 'export';

export interface OptimizationTip {
  id: string;
  type: 'warning' | 'error' | 'suggestion';
  message: string;
  fixable: boolean;
  category: 'media' | 'timeline' | 'performance' | 'assets';
}

export interface ProjectHealth {
  score: number; // 0-100
  warnings: number;
  errors: number;
  tips: OptimizationTip[];
  lastChecked: string;
}

export interface ExportChecklist {
  readyItems: string[];
  warnings: string[];
  blockingErrors: string[];
  isReady: boolean;
}

export interface PipelineAnalytics {
  editingTime: number; // ms
  assetUsage: Record<string, number>;
  timelineStats: {
    clipCount: number;
    trackCount: number;
    duration: number;
  };
  renderHistory: {
    jobId: string;
    duration: number;
    status: string;
  }[];
}
