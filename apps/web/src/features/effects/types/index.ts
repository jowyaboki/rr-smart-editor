export * from '@ai-video-editor/effects-engine';

export interface InspectorPluginContribution {
  id: string;
  name: string;
  component: React.ComponentType<{ effect: any; onChange: (params: any) => void }>;
}
