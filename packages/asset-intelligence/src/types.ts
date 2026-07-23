import { Asset } from '@ai-video-editor/dam';

// Core Models
export interface SemanticEmbedding {
  assetId: string;
  vector: number[]; // High-dimensional numerical embedding vector
  provider: string; // The model/embedding provider name (e.g., openai, clip, Cohere)
  dimensions: number;
  createdAt: string;
}

export interface SemanticIndex {
  id: string;
  embeddings: SemanticEmbedding[];
  lastRebuiltAt: string;
}

export interface SearchQuery {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  embedding?: number[];
  threshold?: number; // Minimum similarity score threshold
  fileTypes?: string[]; // e.g. ['mp4', 'wav', 'png']
  limit?: number;
  hybridWeight?: number; // Weighing factor: 0.0 (only semantic) to 1.0 (only traditional keyword metadata)
}

export type SimilarityScore = number; // float value from 0.0 (no similarity) to 1.0 (exact match)

export interface SearchResult {
  asset: Asset;
  score: SimilarityScore;
  matchedConcepts: string[];
  matchedOcrText?: string;
  matchedTranscript?: string;
  reasoning?: string;
}

export type ClusterCriteria = 'topic' | 'visual_style' | 'people' | 'location' | 'brand' | 'color_palette' | 'project_usage';

export interface AssetCluster {
  id: string;
  name: string;
  criteria: ClusterCriteria;
  assetIds: string[];
  centroidVector?: number[];
  description?: string;
}

export type RecommendationType =
  | 'similar'
  | 'frequently_used_together'
  | 'brand_compatible'
  | 'unused'
  | 'replacement';

export interface Recommendation {
  id: string;
  targetAssetId: string;
  recommendedAsset: Asset;
  type: RecommendationType;
  score: SimilarityScore;
  reason: string;
}

export interface AnalysisProfile {
  extractVisualConcepts: boolean;
  extractObjects: boolean;
  extractFaces: boolean;
  extractScenes: boolean;
  extractActivities: boolean;
  extractLogos: boolean;
  extractOcrText: boolean;
  extractSpeechTranscript: boolean;
  extractMusicMood: boolean;
  extractDominantColors: boolean;
  extractEmotionTags: boolean;
  extractLanguage: boolean;
}

export interface ModerationResult {
  assetId: string;
  isFlagged: boolean;
  flagReasons: Array<'duplicate' | 'low_quality' | 'corrupt_media' | 'inappropriate_content' | 'missing_metadata'>;
  confidenceScore: number;
  details: string;
  moderatedAt: string;
}

// Extensibility Providers
export interface EmbeddingProvider {
  id: string;
  name: string;
  dimensions: number;
  generateTextEmbedding: (text: string) => Promise<number[]>;
  generateImageEmbedding: (imageUrl: string) => Promise<number[]>;
  generateVideoEmbedding: (videoUrl: string) => Promise<number[]>;
}

export interface VisionAnalyzer {
  id: string;
  name: string;
  analyze: (imageUrl: string) => Promise<{
    visualConcepts: string[];
    objects: string[];
    faces: string[];
    scenes: string[];
    activities: string[];
    logos: string[];
    ocrText: string;
    dominantColors: string[];
    emotionTags: string[];
  }>;
}

export interface SpeechAnalyzer {
  id: string;
  name: string;
  transcribe: (audioUrl: string) => Promise<{
    transcript: string;
    language: string;
    emotionTags: string[];
  }>;
}

export interface RecommendationStrategy {
  id: string;
  name: string;
  recommend: (asset: Asset, library: Asset[], embeddings: SemanticEmbedding[]) => Promise<Recommendation[]>;
}

export interface SearchRankingStrategy {
  id: string;
  name: string;
  rank: (results: SearchResult[], query: SearchQuery) => Promise<SearchResult[]>;
}
