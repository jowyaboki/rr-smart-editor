import { useCallback } from 'react';
import { usePluginsStore } from '../store/pluginsStore';
import { PluginManifest, ExtensionPlugin } from '../../../../../packages/plugin-sdk/src/index';

export const usePlugins = () => {
  const store = usePluginsStore();

  return {
    loadedPlugins: store.loadedPlugins,
    customPanels: store.customPanels,
    isHotReloading: store.isHotReloading,

    // Actions
    loadPlugin: store.loadPlugin,
    unloadPlugin: store.unloadPlugin,
    reloadPlugin: store.reloadPlugin,
    syncExtensions: store.syncExtensions,
  };
};
