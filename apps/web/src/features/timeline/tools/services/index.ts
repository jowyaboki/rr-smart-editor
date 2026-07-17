import { EditToolMode, SnappingConfig, NleMarker } from '../types';
import { NleSnappingService } from '../snapping/NleSnappingService';
import { NleGroupingService } from '../grouping/NleGroupingService';
import { NleMarkerService } from '../markers/NleMarkerService';
import { NleShortcutService } from '../shortcuts/NleShortcutService';
import { NleToolService } from './NleToolService';

export {
  NleSnappingService,
  NleGroupingService,
  NleMarkerService,
  NleShortcutService,
  NleToolService,
};

export interface PluginNleTool {
  id: string;
  name: string;
  mode: EditToolMode;
  icon?: string;
  shortcut?: string;
}

export class NlePluginRegistry {
  private static registeredTools: Record<string, PluginNleTool> = {};
  private static customSnappingProviders: Array<(frame: number) => number> = [];

  /**
   * Plugins can contribute custom timeline tools.
   */
  public static registerTool(tool: PluginNleTool): void {
    this.registeredTools[tool.id] = tool;
  }

  /**
   * Plugins can contribute custom snapping targets (such as snapping to audio beats or peak indicators).
   */
  public static registerSnappingProvider(provider: (frame: number) => number): void {
    this.customSnappingProviders.push(provider);
  }

  public static getRegisteredTools(): PluginNleTool[] {
    return Object.values(this.registeredTools);
  }

  public static getCustomSnappingProviders(): Array<(frame: number) => number> {
    return this.customSnappingProviders;
  }

  public static clear(): void {
    this.registeredTools = {};
    this.customSnappingProviders = [];
  }
}
