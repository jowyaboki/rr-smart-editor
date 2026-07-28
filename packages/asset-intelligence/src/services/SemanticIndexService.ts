import { SemanticEmbedding, SemanticIndex } from '../types';

export class SemanticIndexService {
  private indexes: Map<string, SemanticIndex> = new Map();

  public createIndex(id: string): SemanticIndex {
    const index: SemanticIndex = {
      id,
      embeddings: [],
      lastRebuiltAt: new Date().toISOString(),
    };
    this.indexes.set(id, index);
    return index;
  }

  public getIndex(id: string): SemanticIndex | undefined {
    return this.indexes.get(id);
  }

  public updateEmbedding(indexId: string, embedding: SemanticEmbedding): void {
    const idx = this.getIndex(indexId);
    if (!idx) {
      throw new Error(`Index '${indexId}' does not exist.`);
    }
    idx.embeddings = idx.embeddings.filter(e => e.assetId !== embedding.assetId);
    idx.embeddings.push(embedding);
    idx.lastRebuiltAt = new Date().toISOString();
  }

  public removeEmbedding(indexId: string, assetId: string): void {
    const idx = this.getIndex(indexId);
    if (idx) {
      idx.embeddings = idx.embeddings.filter(e => e.assetId !== assetId);
      idx.lastRebuiltAt = new Date().toISOString();
    }
  }

  public rebuildIndex(indexId: string, embeddings: SemanticEmbedding[]): void {
    const idx = this.getIndex(indexId);
    if (!idx) {
      this.createIndex(indexId);
    }
    const targetIdx = this.getIndex(indexId)!;
    targetIdx.embeddings = [...embeddings];
    targetIdx.lastRebuiltAt = new Date().toISOString();
  }
}
