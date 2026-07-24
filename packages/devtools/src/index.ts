export class DevToolsEngine {
  public async getInspectorState() {
    return { activeInspectors: ['TimelineInspector', 'PluginInspector'] };
  }
}
export const globalDevToolsEngine = new DevToolsEngine();
