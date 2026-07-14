import { BasePlugin, PluginContext } from '@ai-video-editor/plugin-sdk';

export default class MediaPlugin extends BasePlugin {
  constructor() {
    super({
      id: 'core:media',
      name: 'Media Library',
      version: '1.0.0',
      author: 'RR Editor',
      description: 'Core media management functionality',
      category: 'media',
      enabled: true
    });
  }

  async install(context: PluginContext): Promise<void> {
    context.eventBus.subscribe('asset:imported', (asset: any) => {
      console.log('MediaPlugin: Asset imported', asset);
    });
  }

  async activate(): Promise<void> {
    console.log('MediaPlugin activated');
  }

  async deactivate(): Promise<void> {
    console.log('MediaPlugin deactivated');
  }

  async dispose(): Promise<void> {}
}
