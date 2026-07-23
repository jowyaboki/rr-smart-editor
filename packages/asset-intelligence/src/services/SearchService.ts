import { Asset } from '@ai-video-editor/dam';
import { SearchQuery, SearchResult, SemanticEmbedding, SimilarityScore, SearchRankingStrategy } from '../types';

export class SearchService {
  private rankingStrategies: SearchRankingStrategy[] = [];

  public registerRankingStrategy(strategy: SearchRankingStrategy): void {
    this.rankingStrategies.push(strategy);
  }

  /**
   * Computes cosine similarity between two numerical vectors
   */
  public computeCosineSimilarity(vecA: number[], vecB: number[]): SimilarityScore {
    if (vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dotProduct / denom;
  }

  /**
   * Performs hybrid search (metadata keywords matching + semantic similarity check)
   */
  public async search(
    query: SearchQuery,
    library: Asset[],
    embeddings: SemanticEmbedding[]
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const threshold = query.threshold !== undefined ? query.threshold : 0.35;

    // If no text query exists, we shouldn't use traditional keyword metadata weight (set to 0.0)
    const hybridWeight = query.text ? (query.hybridWeight !== undefined ? query.hybridWeight : 0.5) : 0.0;

    for (const asset of library) {
      // 1. Calculate traditional metadata match score (0.0 to 1.0)
      let metadataScore = 0;
      const matchedConcepts: string[] = [];
      let matchedOcrText: string | undefined;
      let matchedTranscript: string | undefined;

      const title = asset.metadata.title?.toLowerCase() || '';
      const desc = asset.metadata.description?.toLowerCase() || '';
      const textQuery = query.text?.toLowerCase() || '';

      if (textQuery) {
        let matches = 0;
        if (title.includes(textQuery)) {
          matches += 0.6;
          matchedConcepts.push('title_match');
        }
        if (desc.includes(textQuery)) {
          matches += 0.4;
          matchedConcepts.push('desc_match');
        }

        // Keywords check
        if (asset.metadata.keywords) {
          const matchCount = asset.metadata.keywords.filter(k => k.toLowerCase().includes(textQuery)).length;
          if (matchCount > 0) {
            matches += 0.2 * matchCount;
            matchedConcepts.push('keyword_match');
          }
        }

        // OCR text / transcript check
        if (asset.metadata.customMetadata?.ocrText?.toLowerCase().includes(textQuery)) {
          matches += 0.5;
          matchedOcrText = asset.metadata.customMetadata.ocrText;
          matchedConcepts.push('ocr_match');
        }
        if (asset.metadata.customMetadata?.speechTranscript?.toLowerCase().includes(textQuery)) {
          matches += 0.5;
          matchedTranscript = asset.metadata.customMetadata.speechTranscript;
          matchedConcepts.push('speech_match');
        }

        metadataScore = Math.min(1.0, matches);
      } else {
        metadataScore = 1.0; // If no textual query, metadata score is default
      }

      // 2. Calculate semantic vector score
      let semanticScore = 0;
      if (query.embedding) {
        const emb = embeddings.find(e => e.assetId === asset.id);
        if (emb) {
          semanticScore = this.computeCosineSimilarity(query.embedding, emb.vector);
        }
      } else if (textQuery) {
        // Fallback semantic score if no vector passed (approximate via overlap / keyword embeddings)
        const emb = embeddings.find(e => e.assetId === asset.id);
        if (emb) {
          // If no query embedding provided but text exists, generate an on-the-fly pseudo vector
          const mockQueryVector = this.generateDefaultMockEmbedding(textQuery, emb.vector.length);
          semanticScore = this.computeCosineSimilarity(mockQueryVector, emb.vector);
        }
      }

      // 3. Compute hybrid score
      const finalScore = query.embedding ? (semanticScore * (1 - hybridWeight) + metadataScore * hybridWeight) : (semanticScore || metadataScore);

      // Filter by fileType
      const matchType = query.fileTypes ? query.fileTypes.includes(asset.metadata.fileType) : true;

      if (finalScore >= threshold && matchType) {
        results.push({
          asset,
          score: finalScore,
          matchedConcepts,
          matchedOcrText,
          matchedTranscript,
          reasoning: `Matched via hybrid search with visual & semantic similarity of ${(finalScore * 100).toFixed(0)}%.`,
        });
      }
    }

    // Sort by score descending
    let rankedResults = results.sort((a, b) => b.score - a.score);

    // Run custom registered search ranking strategies
    for (const strategy of this.rankingStrategies) {
      rankedResults = await strategy.rank(rankedResults, query);
    }

    return query.limit ? rankedResults.slice(0, query.limit) : rankedResults;
  }

  private generateDefaultMockEmbedding(seed: string, dimensions: number): number[] {
    const vector = new Array(dimensions).fill(0);
    for (let i = 0; i < seed.length; i++) {
      const charCode = seed.charCodeAt(i);
      const idx = (i * 7) % dimensions;
      vector[idx] = (vector[idx] + charCode) / 255;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map(val => val / magnitude);
  }
}
