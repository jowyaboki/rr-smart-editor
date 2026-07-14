import { EditorPlugin, PluginContext } from './types';

export abstract class BasePlugin implements EditorPlugin {
  constructor(public manifest: any) {}
  abstract install(context: PluginContext): Promise<void>;
  abstract activate(): Promise<void>;
  abstract deactivate(): Promise<void>;
  abstract dispose(): Promise<void>;
}
