import { Composition, CompositionLayer } from '../types';

export class ComposerService {
  private activeComposition: Composition | null = null;
  private compositions: Map<string, Composition> = new Map();

  public createComposition(id: string, name: string): Composition {
    const comp: Composition = {
      id,
      name,
      width: 1920,
      height: 1080,
      fps: 30,
      durationFrames: 300,
      layers: [],
      constraints: [],
      markers: [],
      version: '1.0.0',
    };
    this.compositions.set(id, comp);
    if (!this.activeComposition) {
      this.activeComposition = comp;
    }
    return comp;
  }

  public getActiveComposition(): Composition | null {
    return this.activeComposition;
  }

  public setActiveComposition(id: string): void {
    const comp = this.compositions.get(id);
    if (comp) {
      this.activeComposition = comp;
    }
  }

  public getComposition(id: string): Composition | undefined {
    return this.compositions.get(id);
  }

  public addLayer(compId: string, layer: CompositionLayer): void {
    const comp = this.getComposition(compId);
    if (comp) {
      comp.layers.push(layer);
    }
  }

  public removeLayer(compId: string, layerId: string): void {
    const comp = this.getComposition(compId);
    if (comp) {
      comp.layers = comp.layers.filter((l) => l.id !== layerId);
    }
  }
}
