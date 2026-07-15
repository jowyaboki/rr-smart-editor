import {
  PluginCommand,
  PluginManifest,
  PermissionType,
} from '../../../../../packages/plugin-sdk/src/index';

export interface RegisteredPanel {
  pluginId: string;
  id: string;
  label: string;
  icon: string;
  component: any;
}

export class ExtensionRegistry {
  private static commands = new Map<string, PluginCommand & { pluginId: string }>();
  private static panels = new Map<string, RegisteredPanel>();
  private static pluginPermissions = new Map<string, string[]>();

  /**
   * Registers a plugin's permission scope.
   */
  public static registerPermissions(pluginId: string, permissions: string[]): void {
    this.pluginPermissions.set(pluginId, permissions);
  }

  /**
   * Validates if a plugin is allowed to perform an action.
   */
  public static verifyPermission(pluginId: string, permission: PermissionType): boolean {
    const list = this.pluginPermissions.get(pluginId) || [];
    return list.includes(permission) || list.includes('*');
  }

  /**
   * Registers a custom plugin command.
   */
  public static registerCommand(pluginId: string, command: PluginCommand): void {
    this.commands.set(command.id, { ...command, pluginId });
  }

  /**
   * Registers a custom sidebar panel.
   */
  public static registerSidebarPanel(
    pluginId: string,
    id: string,
    config: { label: string; icon: string; component: any },
  ): void {
    this.panels.set(id, {
      pluginId,
      id,
      label: config.label,
      icon: config.icon,
      component: config.component,
    });
  }

  /**
   * Executes a registered command.
   */
  public static executeCommand(commandId: string, ...args: any[]): any {
    const cmd = this.commands.get(commandId);
    if (!cmd) {
      throw new Error(`Command ${commandId} not found in extension registry.`);
    }
    return cmd.execute(...args);
  }

  /**
   * Retrieves all custom sidebar panels.
   */
  public static getAllSidebarPanels(): RegisteredPanel[] {
    return Array.from(this.panels.values());
  }

  /**
   * Retrieves all registered commands.
   */
  public static getAllCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Unregisters all custom commands and panels for a plugin (unloading).
   */
  public static unregisterPluginExtensions(pluginId: string): void {
    // Clean commands
    this.commands.forEach((val, key) => {
      if (val.pluginId === pluginId) {
        this.commands.delete(key);
      }
    });

    // Clean panels
    this.panels.forEach((val, key) => {
      if (val.pluginId === pluginId) {
        this.panels.delete(key);
      }
    });

    // Clean permissions
    this.pluginPermissions.delete(pluginId);
  }

  /**
   * Resets registries.
   */
  public static clear(): void {
    this.commands.clear();
    this.panels.clear();
    this.pluginPermissions.clear();
  }
}
