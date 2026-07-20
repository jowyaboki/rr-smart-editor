import { Extension, ExtensionManifest, ContributionRegistry } from '../types';

export class ExtensionRegistry {
  private extensions = new Map<string, Extension>();
  private commands = new Map<string, any>();
  private panels = new Map<string, any>();
  private timelineTools = new Map<string, any>();
  private effects = new Map<string, any>();
  private transitions = new Map<string, any>();
  private publishTargets = new Map<string, any>();

  public registerExtension(extension: Extension): void {
    if (this.extensions.has(extension.manifest.id)) {
      throw new Error(`Extension with ID ${extension.manifest.id} is already registered.`);
    }
    this.extensions.set(extension.manifest.id, extension);
    if (extension.enabled) {
      this.activateContributions(extension);
    }
  }

  public unregisterExtension(id: string): void {
    const ext = this.extensions.get(id);
    if (ext) {
      this.deactivateContributions(ext);
      this.extensions.delete(id);
    }
  }

  public enableExtension(id: string): void {
    const ext = this.extensions.get(id);
    if (ext && !ext.enabled) {
      ext.enabled = true;
      ext.state = 'enabled';
      this.activateContributions(ext);
    }
  }

  public disableExtension(id: string): void {
    const ext = this.extensions.get(id);
    if (ext && ext.enabled) {
      ext.enabled = false;
      ext.state = 'disabled';
      this.deactivateContributions(ext);
    }
  }

  public getExtension(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  public listExtensions(): Extension[] {
    return Array.from(this.extensions.values());
  }

  // Active Contributions list getters
  public getCommands(): string[] { return Array.from(this.commands.keys()); }
  public getPanels(): string[] { return Array.from(this.panels.keys()); }
  public getTimelineTools(): string[] { return Array.from(this.timelineTools.keys()); }
  public getEffects(): string[] { return Array.from(this.effects.keys()); }
  public getTransitions(): string[] { return Array.from(this.transitions.keys()); }
  public getPublishTargets(): string[] { return Array.from(this.publishTargets.keys()); }

  private activateContributions(ext: Extension): void {
    const c = ext.contributions;
    if (c.commands) c.commands.forEach(cmd => this.commands.set(cmd.id, cmd));
    if (c.panels) c.panels.forEach(p => this.panels.set(p.id, p));
    if (c.timelineTools) c.timelineTools.forEach(t => this.timelineTools.set(t.id, t));
    if (c.effects) c.effects.forEach(e => this.effects.set(e.id, e));
    if (c.transitions) c.transitions.forEach(tr => this.transitions.set(tr.id, tr));
    if (c.publishTargets) c.publishTargets.forEach(pt => this.publishTargets.set(pt.id, pt));
  }

  private deactivateContributions(ext: Extension): void {
    const c = ext.contributions;
    if (c.commands) c.commands.forEach(cmd => this.commands.delete(cmd.id));
    if (c.panels) c.panels.forEach(p => this.panels.delete(p.id));
    if (c.timelineTools) c.timelineTools.forEach(t => this.timelineTools.delete(t.id));
    if (c.effects) c.effects.forEach(e => this.effects.delete(e.id));
    if (c.transitions) c.transitions.forEach(tr => this.transitions.delete(tr.id));
    if (c.publishTargets) c.publishTargets.forEach(pt => this.publishTargets.delete(pt.id));
  }
}
