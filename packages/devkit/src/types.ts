// Core Models for RR Smart Editor Developer Platform SDK
export type GeneratorType =
  | 'plugin'
  | 'template'
  | 'transition'
  | 'effect'
  | 'node'
  | 'workflow'
  | 'ai_agent'
  | 'data_connector'
  | 'renderer'
  | 'theme'
  | 'panel'
  | 'inspector';

export interface GeneratorConfig {
  name: string;
  type: GeneratorType;
  description: string;
  author: string;
  outputDirectory: string;
  features?: string[]; // e.g. ['typescript', 'tests', 'storyboard', 'documentation']
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export interface ManifestSchema {
  id: string;
  name: string;
  version: string;
  entrypoint: string;
  permissions: string[];
  dependencies: Record<string, string>;
  compatibility: {
    minEditorVersion: string;
    targetNodeVersion: string;
  };
}

export interface BenchmarkMetrics {
  pluginStartupMs: number;
  averageRenderFps: number;
  averageTimelineFps: number;
  peakMemoryMb: number;
  peakCpuPercent: number;
  bundleSizeBytes: number;
}

export interface DocumentationMetadata {
  title: string;
  category: 'api_reference' | 'plugin_docs' | 'sdk_docs' | 'cli_docs' | 'architecture_docs';
  generatedAt: string;
  pagesCount: number;
  sections: Array<{ heading: string; content: string }>;
}

export interface DebuggerSession {
  id: string;
  type: 'plugin' | 'workflow' | 'agent' | 'render' | 'timeline' | 'expression';
  status: 'active' | 'paused' | 'stopped';
  logs: string[];
  breakpoints: string[];
}

export interface LivePreviewOptions {
  port: number;
  hotReload: boolean;
  pluginReload: boolean;
  mockServices: boolean;
}

// Extensibility Plugin Interfaces for tooling
export interface DevKitCliContribution {
  command: string;
  description: string;
  action: (args: string[]) => Promise<void>;
}

export interface DevKitValidator {
  id: string;
  name: string;
  validate: (manifest: ManifestSchema) => Promise<ValidationResult>;
}
