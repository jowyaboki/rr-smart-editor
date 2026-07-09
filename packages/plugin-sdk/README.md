# RR Smart Editor Plugin SDK

The Plugin SDK allows developers to extend the editor with new functionality.

## Plugin Structure

A plugin must implement the `EditorPlugin` interface:

```typescript
import { BasePlugin, PluginContext } from '@ai-video-editor/plugin-sdk';

export default class MyPlugin extends BasePlugin {
  constructor() {
    super({
      id: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
      category: 'ui',
      enabled: true
    });
  }

  async install(context: PluginContext) {
    // Register commands, subscribe to events
  }

  async activate() {
    // Called when the plugin is enabled
  }
}
```

## Extension Points

Plugins can contribute to various UI points:
- Sidebar tabs
- Toolbar buttons
- Inspector sections
- Timeline overlays

## Event Bus

Use `context.eventBus` to communicate with other parts of the editor.
