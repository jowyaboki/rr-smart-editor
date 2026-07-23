import { EmbeddingProvider, SemanticEmbedding } from '../types';

export class EmbeddingService {
  private activeProvider: EmbeddingProvider | null = null;
  private providers: Map<string, EmbeddingProvider> = new Map();

  public registerProvider(provider: EmbeddingProvider): void {
    this.providers.set(provider.id, provider);
    if (!this.activeProvider) {
      this.activeProvider = provider;
    }
  }

  public setActiveProvider(providerId: string): void {
    const prov = this.providers.get(providerId);
    if (prov) {
      this.activeProvider = prov;
    } else {
      throw new Error(`Provider '${providerId}' is not registered.`);
    }
  }

  public getActiveProvider(): EmbeddingProvider | null {
    return this.activeProvider;
  }

  public async generateTextEmbedding(text: string): Promise<number[]> {
    if (!this.activeProvider) {
      return this.generateDefaultMockEmbedding(text);
    }
    return this.activeProvider.generateTextEmbedding(text);
  }

  public async generateImageEmbedding(imageUrl: string): Promise<number[]> {
    if (!this.activeProvider) {
      return this.generateDefaultMockEmbedding(imageUrl);
    }
    return this.activeProvider.generateImageEmbedding(imageUrl);
  }

  public async generateVideoEmbedding(videoUrl: string): Promise<number[]> {
    if (!this.activeProvider) {
      return this.generateDefaultMockEmbedding(videoUrl);
    }
    return this.activeProvider.generateVideoEmbedding(videoUrl);
  }

  // Fallback independent model generator
  private generateDefaultMockEmbedding(seed: string): number[] {
    const dimensions = 128;
    const vector = new Array(dimensions).fill(0);
    // Simple deterministic pseudo-random embedding generator from string seed
    for (let i = 0; i < seed.length; i++) {
      const charCode = seed.charCodeAt(i);
      const idx = (i * 7) % dimensions;
      vector[idx] = (vector[idx] + charCode) / 255;
    }
    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(val => val / magnitude);
  }
}
