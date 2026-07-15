export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  homepage?: string;
  license?: string;
  keywords?: string[];
  engineVersion: string;
  permissions: string[];
  entry: string;
}

export type PermissionType = 'filesystem' | 'network' | 'rendering' | 'ai' | 'clipboard';

export interface PluginContext {
  manifest: PluginManifest;
  eventBus: {
    subscribe: (event: string, callback: (data: any) => void, priority?: number) => void;
    unsubscribe: (event: string, callback: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
  };
  commands: {
    register: (cmd: PluginCommand) => void;
    execute: (id: string, ...args: any[]) => any;
  };
  ui: {
    registerSidebarPanel: (
      id: string,
      config: { label: string; icon: string; component: any },
    ) => void;
    registerInspectorTab: (id: string, config: { label: string; component: any }) => void;
  };
  permissions: {
    checkPermission: (perm: PermissionType) => boolean;
  };
}

export interface PluginCommand {
  id: string;
  title: string;
  icon?: string;
  shortcut?: string;
  execute: (...args: any[]) => void;
}

export interface ExtensionPlugin {
  install: (context: PluginContext) => void;
  uninstall: (context: PluginContext) => void;
}
