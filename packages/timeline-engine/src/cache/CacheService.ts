export class CacheService {
  private geometryCache: Record<string, { x: number; y: number; width: number; height: number }> = {};
  private measurementCache: Record<string, number> = {};
  private thumbnailCache: Record<string, string> = {}; // Maps clipId -> pre-fetched thumbnail URL or keyframe marker
  private visibleRegionCache: any = null;

  public getGeometry(id: string): { x: number; y: number; width: number; height: number } | undefined {
    return this.geometryCache[id];
  }

  public setGeometry(id: string, geom: { x: number; y: number; width: number; height: number }): void {
    this.geometryCache[id] = geom;
  }

  public invalidateGeometry(id?: string): void {
    if (id) {
      delete this.geometryCache[id];
    } else {
      this.geometryCache = {};
    }
  }

  public getMeasurement(key: string): number | undefined {
    return this.measurementCache[key];
  }

  public setMeasurement(key: string, value: number): void {
    this.measurementCache[key] = value;
  }

  public invalidateMeasurements(): void {
    this.measurementCache = {};
  }

  public getThumbnail(clipId: string): string | undefined {
    return this.thumbnailCache[clipId];
  }

  public setThumbnail(clipId: string, url: string): void {
    this.thumbnailCache[clipId] = url;
  }

  public getCachedVisibleRegion(): any {
    return this.visibleRegionCache;
  }

  public setCachedVisibleRegion(region: any): void {
    this.visibleRegionCache = region;
  }

  public clearAll(): void {
    this.geometryCache = {};
    this.measurementCache = {};
    this.thumbnailCache = {};
    this.visibleRegionCache = null;
  }
}
