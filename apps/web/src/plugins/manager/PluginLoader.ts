import { EditorPlugin } from '@ai-video-editor/plugin-sdk';
import { pluginRegistry } from './PluginRegistry';

export const PluginLoader = {
  async loadFromModules(modules: any[]): Promise<void> {
    for (const module of modules) {
      if (module.default && typeof module.default === 'function') {
        const PluginClass = module.default;
        const plugin = new PluginClass() as EditorPlugin;
        await pluginRegistry.register(plugin);
      }
    }
  }
};
