import { EditorPlugin, EventBus, CommandRegistry } from '@ai-video-editor/plugin-sdk';

export class PluginRegistry {
  private plugins: Map<string, EditorPlugin> = new Map();
  private eventBus = new EventBus();
  private commands = new CommandRegistry();

  async register(plugin: EditorPlugin): Promise<void> {
    const id = plugin.manifest.id;
    if (this.plugins.has(id)) {
      console.warn(`Plugin ${id} already registered`);
      return;
    }

    await plugin.install({
      eventBus: this.eventBus,
      commands: this.commands,
      services: {} // Provide core services here
    });

    if (plugin.manifest.enabled) {
      await plugin.activate();
    }

    this.plugins.set(id, plugin);
    this.eventBus.emit('plugin:registered', plugin.manifest);
  }

  async enable(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (plugin && !plugin.manifest.enabled) {
      await plugin.activate();
      plugin.manifest.enabled = true;
      this.eventBus.emit('plugin:enabled', id);
    }
  }

  async disable(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (plugin && plugin.manifest.enabled) {
      await plugin.deactivate();
      plugin.manifest.enabled = false;
      this.eventBus.emit('plugin:disabled', id);
    }
  }

  list(): EditorPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry();
