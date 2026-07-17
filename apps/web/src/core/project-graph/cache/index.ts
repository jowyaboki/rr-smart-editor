export class IncrementalCache {
  private cache: Record<string, { value: any; version: number }> = {};

  public get(nodeId: string, currentVersion: number): any | undefined {
    const entry = this.cache[nodeId];
    if (entry && entry.version === currentVersion) {
      return entry.value;
    }
    return undefined;
  }

  public set(nodeId: string, value: any, version: number): void {
    this.cache[nodeId] = { value, version };
  }

  public invalidate(nodeId: string): void {
    delete this.cache[nodeId];
  }

  public clear(): void {
    this.cache = {};
  }
}
