export interface PluginUIContribution {
  id: string;
  point: 'sidebar' | 'toolbar' | 'inspector' | 'timeline' | 'settings';
  label: string;
  icon?: string;
  component: string; // Dynamic component name or ID
}

export interface PluginCapabilities {
  canRender?: boolean;
  canImport?: boolean;
  canSuggestAI?: boolean;
}
