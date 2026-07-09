import { BasePlugin, PluginContext } from '@ai-video-editor/plugin-sdk';

export default class AIPlugin extends BasePlugin {
  constructor() {
    super({
      id: 'core:ai',
      name: 'AI Assistant',
      version: '1.0.0',
      author: 'RR Editor',
      description: 'Core AI assistant and generation',
      category: 'ai',
      enabled: true
    });
  }

  async install(context: PluginContext): Promise<void> {
    console.log('AIPlugin installed');
  }

  async activate(): Promise<void> {
    console.log('AIPlugin activated');
  }

  async deactivate(): Promise<void> {
    console.log('AIPlugin deactivated');
  }

  async dispose(): Promise<void> {}
}
