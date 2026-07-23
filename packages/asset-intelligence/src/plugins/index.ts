import {
  EmbeddingProvider,
  VisionAnalyzer,
  SpeechAnalyzer,
  RecommendationStrategy,
  SearchRankingStrategy,
} from '../types';

export class AssetIntelligencePluginRegistry {
  private embeddingProviders: Map<string, EmbeddingProvider> = new Map();
  private visionAnalyzers: Map<string, VisionAnalyzer> = new Map();
  private speechAnalyzers: Map<string, SpeechAnalyzer> = new Map();
  private recommendationStrategies: Map<string, RecommendationStrategy> = new Map();
  private searchRankingStrategies: Map<string, SearchRankingStrategy> = new Map();

  public registerEmbeddingProvider(provider: EmbeddingProvider): void {
    this.embeddingProviders.set(provider.id, provider);
  }

  public registerVisionAnalyzer(analyzer: VisionAnalyzer): void {
    this.visionAnalyzers.set(analyzer.id, analyzer);
  }

  public registerSpeechAnalyzer(analyzer: SpeechAnalyzer): void {
    this.speechAnalyzers.set(analyzer.id, analyzer);
  }

  public registerRecommendationStrategy(strategy: RecommendationStrategy): void {
    this.recommendationStrategies.set(strategy.id, strategy);
  }

  public registerSearchRankingStrategy(strategy: SearchRankingStrategy): void {
    this.searchRankingStrategies.set(strategy.id, strategy);
  }

  public getEmbeddingProvider(id: string): EmbeddingProvider | undefined {
    return this.embeddingProviders.get(id);
  }

  public getVisionAnalyzer(id: string): VisionAnalyzer | undefined {
    return this.visionAnalyzers.get(id);
  }

  public getSpeechAnalyzer(id: string): SpeechAnalyzer | undefined {
    return this.speechAnalyzers.get(id);
  }

  public listEmbeddingProviders(): EmbeddingProvider[] {
    return Array.from(this.embeddingProviders.values());
  }

  public listVisionAnalyzers(): VisionAnalyzer[] {
    return Array.from(this.visionAnalyzers.values());
  }

  public listSpeechAnalyzers(): SpeechAnalyzer[] {
    return Array.from(this.speechAnalyzers.values());
  }

  public listRecommendationStrategies(): RecommendationStrategy[] {
    return Array.from(this.recommendationStrategies.values());
  }

  public listSearchRankingStrategies(): SearchRankingStrategy[] {
    return Array.from(this.searchRankingStrategies.values());
  }
}
export const globalPluginRegistry = new AssetIntelligencePluginRegistry();
