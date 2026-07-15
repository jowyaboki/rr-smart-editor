import { create } from 'zustand';
import { PluginManifest, ExtensionPlugin } from '../../../../../packages/plugin-sdk/src/index';
import { PluginManagerService } from '../services/PluginManagerService';
import { ExtensionRegistry, RegisteredPanel } from '../registry/ExtensionRegistry';

export interface PluginsStoreState {
  loadedPlugins: PluginManifest[];
  customPanels: RegisteredPanel[];
  isHotReloading: boolean;

  // Actions
  loadPlugin: (manifest: PluginManifest, instance: ExtensionPlugin) => void;
  unloadPlugin: (id: string) => void;
  reloadPlugin: (manifest: PluginManifest, instance: ExtensionPlugin) => void;
  syncExtensions: () => void;
}

export const usePluginsStore = create<PluginsStoreState>((set, get) => ({
  loadedPlugins: [],
  customPanels: [],
  isHotReloading: false,

  loadPlugin: (manifest, instance) => {
    PluginManagerService.loadPlugin(manifest, instance);
    get().syncExtensions();
  },

  unloadPlugin: (id) => {
    PluginManagerService.unloadPlugin(id);
    get().syncExtensions();
  },

  reloadPlugin: (manifest, instance) => {
    set({ isHotReloading: true });
    try {
      PluginManagerService.unloadPlugin(manifest.id);
      PluginManagerService.loadPlugin(manifest, instance);
      get().syncExtensions();
    } catch (err) {
      console.error(`Hot reload failed for plugin ${manifest.id}:`, err);
    } finally {
      set({ isHotReloading: false });
    }
  },

  syncExtensions: () => {
    set({
      loadedPlugins: PluginManagerService.getLoadedPlugins(),
      customPanels: ExtensionRegistry.getAllSidebarPanels(),
    });
  },
}));
