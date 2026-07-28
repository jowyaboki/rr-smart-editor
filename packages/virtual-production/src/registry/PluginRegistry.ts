import {
  CameraAdapter,
  TrackingAdapter,
  EnvironmentAdapter,
  MocapAdapter,
} from '../types';

export class PluginRegistry {
  private cameraAdapters = new Map<string, CameraAdapter>();
  private trackingAdapters = new Map<string, TrackingAdapter>();
  private environmentAdapters = new Map<string, EnvironmentAdapter>();
  private mocapAdapters = new Map<string, MocapAdapter>();
  private customLightingModels = new Map<string, any>();

  // Camera Adapters
  public registerCameraAdapter(adapter: CameraAdapter): void {
    this.cameraAdapters.set(adapter.id, adapter);
  }

  public getCameraAdapter(id: string): CameraAdapter | undefined {
    return this.cameraAdapters.get(id);
  }

  public listCameraAdapters(): CameraAdapter[] {
    return Array.from(this.cameraAdapters.values());
  }

  // Tracking Adapters
  public registerTrackingAdapter(adapter: TrackingAdapter): void {
    this.trackingAdapters.set(adapter.id, adapter);
  }

  public getTrackingAdapter(id: string): TrackingAdapter | undefined {
    return this.trackingAdapters.get(id);
  }

  public listTrackingAdapters(): TrackingAdapter[] {
    return Array.from(this.trackingAdapters.values());
  }

  // Environment Adapters
  public registerEnvironmentAdapter(adapter: EnvironmentAdapter): void {
    this.environmentAdapters.set(adapter.id, adapter);
  }

  public getEnvironmentAdapter(id: string): EnvironmentAdapter | undefined {
    return this.environmentAdapters.get(id);
  }

  public listEnvironmentAdapters(): EnvironmentAdapter[] {
    return Array.from(this.environmentAdapters.values());
  }

  // Mocap Adapters
  public registerMocapAdapter(adapter: MocapAdapter): void {
    this.mocapAdapters.set(adapter.id, adapter);
  }

  public getMocapAdapter(id: string): MocapAdapter | undefined {
    return this.mocapAdapters.get(id);
  }

  public listMocapAdapters(): MocapAdapter[] {
    return Array.from(this.mocapAdapters.values());
  }

  // Lighting Models
  public registerLightingModel(id: string, model: any): void {
    this.customLightingModels.set(id, model);
  }

  public getLightingModel(id: string): any {
    return this.customLightingModels.get(id);
  }

  public listLightingModels(): string[] {
    return Array.from(this.customLightingModels.keys());
  }

  public clear(): void {
    this.cameraAdapters.clear();
    this.trackingAdapters.clear();
    this.environmentAdapters.clear();
    this.mocapAdapters.clear();
    this.customLightingModels.clear();
  }
}

export const globalPluginRegistry = new PluginRegistry();
