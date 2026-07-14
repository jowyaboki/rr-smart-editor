export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'transitions' | 'effects' | 'ai' | 'media' | 'ui' | 'export';
  icon?: string;
  dependencies?: string[];
  permissions?: string[];
  enabled: boolean;
}

export interface PluginContext {
  eventBus: any;
  commands: any;
  services: any;
}

export interface EditorPlugin {
  manifest: PluginManifest;
  install(context: PluginContext): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;
}
