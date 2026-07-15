import {
  PluginManifest,
  PluginContext,
  PermissionType,
  PluginCommand,
  ExtensionPlugin,
} from '../../../../../packages/plugin-sdk/src/index';
import { ExtensionRegistry } from '../registry/ExtensionRegistry';

export class PluginManagerService {
  private static loadedPlugins = new Map<
    string,
    { manifest: PluginManifest; instance: ExtensionPlugin }
  >();
  private static globalListeners = new Map<
    string,
    Array<{ callback: (data: any) => void; priority: number }>
  >();

  /**
   * Validates a plugin manifest before loading.
   */
  public static validateManifest(manifest: any): manifest is PluginManifest {
    return (
      manifest &&
      typeof manifest.id === 'string' &&
      typeof manifest.name === 'string' &&
      typeof manifest.version === 'string' &&
      typeof manifest.entry === 'string' &&
      Array.isArray(manifest.permissions)
    );
  }

  /**
   * Loads and installs a plugin into the editor runtime.
   */
  public static loadPlugin(manifest: PluginManifest, pluginInstance: ExtensionPlugin): void {
    if (this.loadedPlugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already loaded.`);
    }

    // Register permissions
    ExtensionRegistry.registerPermissions(manifest.id, manifest.permissions);

    // Create a secure, sandboxed PluginContext
    const context: PluginContext = {
      manifest,
      eventBus: {
        subscribe: (event: string, callback: (data: any) => void, priority: number = 10) => {
          let list = this.globalListeners.get(event);
          if (!list) {
            list = [];
            this.globalListeners.set(event, list);
          }
          list.push({ callback, priority });
          // Sort descending priority
          list.sort((a, b) => b.priority - a.priority);
        },
        unsubscribe: (event: string, callback: (data: any) => void) => {
          const list = this.globalListeners.get(event);
          if (list) {
            this.globalListeners.set(
              event,
              list.filter((item) => item.callback !== callback),
            );
          }
        },
        emit: (event: string, data: any) => {
          const list = this.globalListeners.get(event);
          if (list) {
            list.forEach((item) => {
              try {
                item.callback(data);
              } catch (err) {
                console.error(`Error in event callback of plugin ${manifest.id}:`, err);
              }
            });
          }
        },
      },
      commands: {
        register: (cmd: PluginCommand) => {
          ExtensionRegistry.registerCommand(manifest.id, cmd);
        },
        execute: (id: string, ...args: any[]) => {
          return ExtensionRegistry.executeCommand(id, ...args);
        },
      },
      ui: {
        registerSidebarPanel: (
          id: string,
          config: { label: string; icon: string; component: any },
        ) => {
          ExtensionRegistry.registerSidebarPanel(manifest.id, id, config);
        },
        registerInspectorTab: (id: string, config: { label: string; component: any }) => {
          // Expose inspector registration boundary
        },
      },
      permissions: {
        checkPermission: (perm: PermissionType) => {
          return ExtensionRegistry.verifyPermission(manifest.id, perm);
        },
      },
    };

    // Install the extension safely
    pluginInstance.install(context);

    this.loadedPlugins.set(manifest.id, { manifest, instance: pluginInstance });
  }

  /**
   * Unloads and uninstalls a plugin.
   */
  public static unloadPlugin(pluginId: string): void {
    const record = this.loadedPlugins.get(pluginId);
    if (!record) return;

    // Create context representing uninstall environment
    const dummyContext: any = { manifest: record.manifest };

    // Uninstall safely
    try {
      record.instance.uninstall(dummyContext);
    } catch (err) {
      console.error(`Error during uninstall of plugin ${pluginId}:`, err);
    }

    // Clean registries
    ExtensionRegistry.unregisterPluginExtensions(pluginId);
    this.loadedPlugins.delete(pluginId);
  }

  /**
   * Retrieves all loaded plugins.
   */
  public static getLoadedPlugins(): PluginManifest[] {
    return Array.from(this.loadedPlugins.values()).map((p) => p.manifest);
  }
}
