import { ColorManagementService } from './services/ColorManagementService';
import { GradingService } from './services/GradingService';
import { LUTService } from './services/LUTService';
import { HDRService } from './services/HDRService';
import { CalibrationService } from './services/CalibrationService';
import { ScopeService } from './services/ScopeService';
import { ColorPipelineService } from './services/ColorPipelineService';
import { ColorPluginRegistry, globalColorPluginRegistry } from './registry/ColorPluginRegistry';
import { Grade } from './types';

export class ColorScienceEngine {
  public readonly managementService = new ColorManagementService();
  public readonly gradingService = new GradingService();
  public readonly lutService = new LUTService();
  public readonly hdrService = new HDRService();
  public readonly calibrationService = new CalibrationService();
  public readonly scopeService = new ScopeService();
  public readonly pluginRegistry = globalColorPluginRegistry;

  public readonly pipelineService = new ColorPipelineService(
    this.managementService,
    this.gradingService,
    this.lutService
  );

  private listeners = new Map<string, Array<(data: any) => void>>();

  /**
   * Loosely-coupled event publishing
   */
  public publish(event: string, data: any): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error executing callback for event "${event}":`, e);
        }
      });
    }
  }

  /**
   * Loosely-coupled event subscription
   */
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(event, list.filter(cb => cb !== callback));
      }
    };
  }

  /**
   * Instantiates a pristine, default ASC CDL Grade structure
   */
  public createDefaultGrade(id: string, name: string): Grade {
    return {
      id,
      name,
      lift: { rgb: [0, 0, 0], luminance: 0 },
      gamma: { rgb: [1, 1, 1], luminance: 0 },
      gain: { rgb: [1, 1, 1], luminance: 0 },
      offset: { rgb: [0, 0, 0], luminance: 0 },
      contrast: 1.0,
      pivot: 0.435,
      saturation: 1.0,
      temperature: 0,
      tint: 0,
      rgbMixer: {
        red: [1, 0, 0],
        green: [0, 1, 0],
        blue: [0, 0, 1],
      },
      curves: {
        master: [[0, 0], [1, 1]],
        red: [[0, 0], [1, 1]],
        green: [[0, 0], [1, 1]],
        blue: [[0, 0], [1, 1]],
        hueVsHue: [[0, 0], [1, 1]],
        hueVsSat: [[0, 0], [1, 1]],
        hueVsLum: [[0, 0], [1, 1]],
      },
      logWheels: {
        shadows: { rgb: [1, 1, 1], luminance: 0 },
        midtones: { rgb: [1, 1, 1], luminance: 0 },
        highlights: { rgb: [1, 1, 1], luminance: 0 },
        shadowLimit: 0.18,
        highlightLimit: 0.55,
      },
      schemaVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      extensions: {},
    };
  }
}

export const globalColorScienceEngine = new ColorScienceEngine();
