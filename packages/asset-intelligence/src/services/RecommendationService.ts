import { Asset } from '@ai-video-editor/dam';
import { Recommendation, RecommendationStrategy, SemanticEmbedding } from '../types';

export class RecommendationService {
  private strategies: RecommendationStrategy[] = [];

  public registerStrategy(strategy: RecommendationStrategy): void {
    this.strategies.push(strategy);
  }

  public async recommend(
    asset: Asset,
    library: Asset[],
    embeddings: SemanticEmbedding[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Filter library to exclude target asset itself
    const candidates = library.filter(a => a.id !== asset.id);

    // Compute basic cosine-similarity recommendations
    const targetEmb = embeddings.find(e => e.assetId === asset.id);

    for (const cand of candidates) {
      let score = 0;
      let reason = '';

      const candEmb = embeddings.find(e => e.assetId === cand.id);
      if (targetEmb && candEmb) {
        score = this.computeCosineSimilarity(targetEmb.vector, candEmb.vector);
      } else {
        // Fallback title matching
        score = cand.metadata.title === asset.metadata.title ? 0.9 : 0.1;
      }

      // Check if frequently used together
      const usedTogether = asset.usage.projectsUsedIn.some(p => cand.usage.projectsUsedIn.includes(p));
      const brandCompatible = asset.metadata.colorPalette && cand.metadata.colorPalette
        ? asset.metadata.colorPalette.some(c => cand.metadata.colorPalette?.includes(c))
        : false;

      if (score >= 0.5) {
        recommendations.push({
          id: `rec_sim_${cand.id}`,
          targetAssetId: asset.id,
          recommendedAsset: cand,
          type: 'similar',
          score,
          reason: `High semantic similarity index match of ${(score * 100).toFixed(0)}%.`,
        });
      }

      if (usedTogether) {
        recommendations.push({
          id: `rec_together_${cand.id}`,
          targetAssetId: asset.id,
          recommendedAsset: cand,
          type: 'frequently_used_together',
          score: Math.max(0.6, score),
          reason: 'Both assets are frequently utilized in the same projects.',
        });
      }

      if (brandCompatible) {
        recommendations.push({
          id: `rec_brand_${cand.id}`,
          targetAssetId: asset.id,
          recommendedAsset: cand,
          type: 'brand_compatible',
          score: Math.max(0.55, score),
          reason: 'Matches brand design tokens and color palettes.',
        });
      }

      // Unused suggestion
      if (cand.usage.projectsUsedIn.length === 0) {
        recommendations.push({
          id: `rec_unused_${cand.id}`,
          targetAssetId: asset.id,
          recommendedAsset: cand,
          type: 'unused',
          score: 0.5,
          reason: 'This high quality asset has not been utilized in any editor compositions yet.',
        });
      }
    }

    // Combine custom external strategies
    for (const strategy of this.strategies) {
      const customRecs = await strategy.recommend(asset, library, embeddings);
      recommendations.push(...customRecs);
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
