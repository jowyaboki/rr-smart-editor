import { EmbeddingService } from './services/EmbeddingService';
import { SemanticIndexService } from './services/SemanticIndexService';
import { SearchService } from './services/SearchService';
import { RecommendationService } from './services/RecommendationService';
import { ClusteringService } from './services/ClusteringService';
import { ModerationService } from './services/ModerationService';
import { globalPluginRegistry, AssetIntelligencePluginRegistry } from './plugins';
import {
  AnalysisProfile,
  AssetCluster,
  ClusterCriteria,
  Recommendation,
  SearchResult,
  SemanticEmbedding,
  SemanticIndex,
  SearchQuery,
  ModerationResult,
} from './types';
import { Asset } from '@ai-video-editor/dam';

export * from './types';
export * from './services/EmbeddingService';
export * from './services/SemanticIndexService';
export * from './services/SearchService';
export * from './services/RecommendationService';
export * from './services/ClusteringService';
export * from './services/ModerationService';
export * from './plugins';

export class AssetIntelligenceEngine {
  public embeddingService: EmbeddingService;
  public semanticIndexService: SemanticIndexService;
  public searchService: SearchService;
  public recommendationService: RecommendationService;
  public clusteringService: ClusteringService;
  public moderationService: ModerationService;
  public plugins: AssetIntelligencePluginRegistry;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.semanticIndexService = new SemanticIndexService();
    this.searchService = new SearchService();
    this.recommendationService = new RecommendationService();
    this.clusteringService = new ClusteringService();
    this.moderationService = new ModerationService();
    this.plugins = globalPluginRegistry;
  }

  /**
   * Automatically analyzes an asset, extracts visual concepts / Speech transcription,
   * generates vector embeddings, and registers the semantic index entry.
   */
  public async analyzeAndIndexAsset(
    asset: Asset,
    indexId: string,
    profile: AnalysisProfile,
    library: Asset[] = []
  ): Promise<{
    embedding: SemanticEmbedding;
    concepts: string[];
    transcript?: string;
    moderation: ModerationResult;
  }> {
    // 1. Analyze using vision/speech analyzer if registered
    let concepts: string[] = [];
    let transcript: string | undefined;

    const vision = this.plugins.listVisionAnalyzers()[0];
    if (vision && (profile.extractVisualConcepts || profile.extractObjects)) {
      const visResult = await vision.analyze(asset.url);
      concepts = [...visResult.visualConcepts, ...visResult.objects, ...visResult.logos];
      asset.metadata.aiGeneratedTags = concepts;
      if (visResult.ocrText && profile.extractOcrText) {
        asset.metadata.customMetadata = asset.metadata.customMetadata || {};
        asset.metadata.customMetadata.ocrText = visResult.ocrText;
      }
    }

    const speech = this.plugins.listSpeechAnalyzers()[0];
    if (speech && profile.extractSpeechTranscript && asset.metadata.fileType === 'wav') {
      const audResult = await speech.transcribe(asset.url);
      transcript = audResult.transcript;
      asset.metadata.customMetadata = asset.metadata.customMetadata || {};
      asset.metadata.customMetadata.speechTranscript = transcript;
      if (audResult.language && profile.extractLanguage) {
        asset.metadata.language = audResult.language;
      }
    }

    // 2. Generate multi-provider independent embedding vector
    const provider = this.embeddingService.getActiveProvider()?.id || 'cohere_clip_v3';
    let vector: number[] = [];

    if (asset.metadata.fileType === 'mp4' || asset.metadata.fileType === 'mov') {
      vector = await this.embeddingService.generateVideoEmbedding(asset.url);
    } else if (asset.metadata.fileType === 'wav' || asset.metadata.fileType === 'mp3') {
      vector = await this.embeddingService.generateTextEmbedding(transcript || asset.name);
    } else {
      vector = await this.embeddingService.generateImageEmbedding(asset.url);
    }

    const embedding: SemanticEmbedding = {
      assetId: asset.id,
      vector,
      provider,
      dimensions: vector.length,
      createdAt: new Date().toISOString(),
    };

    // Store in internal semantic index
    this.semanticIndexService.updateEmbedding(indexId, embedding);

    // 3. Scan for moderation check
    const moderation = await this.moderationService.moderate(asset, library);

    return {
      embedding,
      concepts,
      transcript,
      moderation,
    };
  }
}
export const globalAssetIntelligenceEngine = new AssetIntelligenceEngine();
