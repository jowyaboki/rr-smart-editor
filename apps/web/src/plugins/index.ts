import { PluginLoader } from './manager/PluginLoader';
import MediaPlugin from './core/MediaPlugin';
import AIPlugin from './core/AIPlugin';

export const initializePlugins = async () => {
  await PluginLoader.loadFromModules([
    { default: MediaPlugin },
    { default: AIPlugin }
  ]);
};
