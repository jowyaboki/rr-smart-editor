import { StudioService } from './services/StudioService';
import { CameraService } from './services/CameraService';
import { LightingService } from './services/LightingService';
import { EnvironmentService } from './services/EnvironmentService';
import { TrackingService } from './services/TrackingService';
import { CalibrationService } from './services/CalibrationService';
import { CompositingService } from './services/CompositingService';
import { RenderInstructionBuilder } from './utils/RenderInstructionBuilder';
import { PluginRegistry, globalPluginRegistry } from './registry/PluginRegistry';
import { VirtualStudio } from './types';

export class VirtualStudioEngine {
  public readonly studioService = new StudioService();
  public readonly cameraService = new CameraService();
  public readonly lightingService = new LightingService();
  public readonly environmentService = new EnvironmentService();
  public readonly trackingService = new TrackingService();
  public readonly calibrationService = new CalibrationService();
  public readonly compositingService = new CompositingService();
  public readonly renderInstructionBuilder = new RenderInstructionBuilder();
  public readonly pluginRegistry = globalPluginRegistry;

  private listeners = new Map<string, Array<(data: any) => void>>();

  /**
   * Typed loosely-coupled event publishing
   */
  public publish(event: string, data: any): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error executing callback for event "${event}":`, e);
        }
      });
    }
  }

  /**
   * Typed loosely-coupled event subscription
   */
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(
          event,
          list.filter((cb) => cb !== callback),
        );
      }
    };
  }

  /**
   * Triggers re-evaluation and emits StudioChanged events
   */
  public updateStudioState(
    studio: VirtualStudio,
    updateFn: (studio: VirtualStudio) => VirtualStudio,
  ): VirtualStudio {
    const nextState = updateFn(studio);
    this.publish('StudioChanged', nextState);
    return nextState;
  }
}

export const globalVirtualStudioEngine = new VirtualStudioEngine();
