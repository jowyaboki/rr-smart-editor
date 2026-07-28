import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Asset } from '@ai-video-editor/dam';
import {
  AssetIntelligenceEngine,
  EmbeddingProvider,
  VisionAnalyzer,
  SpeechAnalyzer,
} from '../src/index';

describe('Asset Intelligence Platform Core Unit Tests', () => {

  // Setup sample mock Assets compatible with DAM Asset schemas
  const mockLibrary: Asset[] = [
    {
      id: 'ast_vector_promo',
      name: 'Dynamic Vector Explainer.mp4',
      checksum: 'sha256_hash_vector',
      url: 'https://cdn.editor.com/vector.mp4',
      metadata: {
        title: 'Modern Flat Vector Promo',
        description: 'Vibrant motion graphic explainer',
        keywords: ['promo', 'tech', 'motion'],
        categories: ['marketing'],
        author: 'Editor Studio',
        fileType: 'mp4',
        dominantColors: ['#3b82f6', '#ec4899'],
      },
      license: { licenseType: 'commercial', attributionRequired: false, commercialUse: true },
      approval: { status: 'approved', history: [] },
      usage: { projectsUsedIn: ['proj_1'], scenesCount: 2, timelineClipsCount: 4, templatesUsedIn: [], publishedVideos: [] },
      versions: [],
      collections: [],
    },
    {
      id: 'ast_acoustic_bg',
      name: 'Chill Acoustic Background.wav',
      checksum: 'sha256_hash_acoustic',
      url: 'https://cdn.editor.com/bg_music.wav',
      metadata: {
        title: 'Calm Folk Acoustic Guitar',
        description: 'Soothing instrumental soundtrack',
        keywords: ['calm', 'music', 'guitar', 'acoustic'],
        categories: ['audio'],
        author: 'Audio Expert',
        fileType: 'wav',
      },
      license: { licenseType: 'royalty_free', attributionRequired: true, commercialUse: true },
      approval: { status: 'approved', history: [] },
      usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
      versions: [],
      collections: [],
    },
  ];

  test('Similarity Ranking - Cosine Similarity correctness', () => {
    const engine = new AssetIntelligenceEngine();

    const vecA = [1.0, 0.0, 0.0];
    const vecB = [1.0, 0.0, 0.0];
    const vecC = [0.0, 1.0, 0.0]; // Orthogonal

    const simExact = engine.searchService.computeCosineSimilarity(vecA, vecB);
    const simOrtho = engine.searchService.computeCosineSimilarity(vecA, vecC);

    assert.strictEqual(simExact, 1.0);
    assert.strictEqual(simOrtho, 0.0);
  });

  test('Semantic Indexing & Analysis profile extraction', async () => {
    const engine = new AssetIntelligenceEngine();

    // Register a mock Vision Analyzer
    const mockVision: VisionAnalyzer = {
      id: 'vision_mock',
      name: 'Mock Vision Analyzer',
      analyze: async (url) => ({
        visualConcepts: ['abstract', 'gradient'],
        objects: ['shape', 'polygon'],
        faces: [],
        scenes: ['studio'],
        activities: [],
        logos: ['company_logo'],
        ocrText: 'TRANSCRIPT TEXT FROM OCR',
        dominantColors: ['#000000'],
        emotionTags: ['vibrant'],
      }),
    };
    engine.plugins.registerVisionAnalyzer(mockVision);

    // Register a mock Speech Analyzer
    const mockSpeech: SpeechAnalyzer = {
      id: 'speech_mock',
      name: 'Mock Speech Analyzer',
      transcribe: async (url) => ({
        transcript: 'Today we will discuss video editing automations.',
        language: 'en',
        emotionTags: ['calm'],
      }),
    };
    engine.plugins.registerSpeechAnalyzer(mockSpeech);

    const targetAsset = mockLibrary[0]; // Video asset
    const indexId = 'main_index';
    engine.semanticIndexService.createIndex(indexId);

    const profile = {
      extractVisualConcepts: true,
      extractObjects: true,
      extractFaces: false,
      extractScenes: true,
      extractActivities: false,
      extractLogos: true,
      extractOcrText: true,
      extractSpeechTranscript: true,
      extractMusicMood: false,
      extractDominantColors: false,
      extractEmotionTags: false,
      extractLanguage: false,
    };

    const result = await engine.analyzeAndIndexAsset(targetAsset, indexId, profile, mockLibrary);

    assert.ok(result.embedding);
    assert.strictEqual(result.embedding.dimensions, 128); // Default fallback dimensions
    assert.ok(result.concepts.includes('gradient'));
    assert.ok(result.concepts.includes('company_logo'));
    assert.ok(targetAsset.metadata.aiGeneratedTags?.includes('abstract'));

    // Check Index registered
    const index = engine.semanticIndexService.getIndex(indexId);
    assert.strictEqual(index?.embeddings.length, 1);
    assert.strictEqual(index.embeddings[0].assetId, targetAsset.id);
  });

  test('Search Relevance & Hybrid Ranking', async () => {
    const engine = new AssetIntelligenceEngine();
    const indexId = 'main_index';
    engine.semanticIndexService.createIndex(indexId);

    // Setup custom embeddings for tests
    const promoEmb = [0.9, 0.1, 0.0, 0.0];
    const acousticEmb = [0.0, 0.0, 0.8, 0.6];

    const embeddings = [
      { assetId: 'ast_vector_promo', vector: promoEmb, provider: 'mock', dimensions: 4, createdAt: '' },
      { assetId: 'ast_acoustic_bg', vector: acousticEmb, provider: 'mock', dimensions: 4, createdAt: '' },
    ];

    engine.semanticIndexService.rebuildIndex(indexId, embeddings);

    // 1. Traditional textual metadata query matching 'acoustic' with higher threshold
    const results1 = await engine.searchService.search({ text: 'acoustic', threshold: 0.1 }, mockLibrary, embeddings);
    assert.strictEqual(results1[0].asset.id, 'ast_acoustic_bg');

    // 2. Semantic vector query matching acousticEmb
    const resultsSemantic = await engine.searchService.search({ embedding: [0.0, 0.0, 1.0, 0.0], threshold: 0.5 }, mockLibrary, embeddings);
    assert.strictEqual(resultsSemantic.length, 1);
    assert.strictEqual(resultsSemantic[0].asset.id, 'ast_acoustic_bg');
    assert.ok(resultsSemantic[0].score > 0.7);
  });

  test('Intelligent Recommendations quality', async () => {
    const engine = new AssetIntelligenceEngine();

    const embeddings = [
      { assetId: 'ast_vector_promo', vector: [0.9, 0.1], provider: 'mock', dimensions: 2, createdAt: '' },
      { assetId: 'ast_acoustic_bg', vector: [0.1, 0.9], provider: 'mock', dimensions: 2, createdAt: '' },
    ];

    // Get recommendations for 'Dynamic Vector Explainer'
    const recs = await engine.recommendationService.recommend(mockLibrary[0], mockLibrary, embeddings);

    // Should recommend ast_acoustic_bg as 'unused' since its usage count is 0
    assert.ok(recs.some(r => r.type === 'unused'));
    assert.strictEqual(recs.find(r => r.type === 'unused')?.recommendedAsset.id, 'ast_acoustic_bg');
  });

  test('Clustering & Moderation controls', async () => {
    const engine = new AssetIntelligenceEngine();

    // 1. Clustering by topic category
    const clusters = await engine.clusteringService.cluster(mockLibrary, [], 'topic');
    assert.ok(clusters.length > 0);
    assert.ok(clusters.some(c => c.name.toLowerCase().includes('marketing')));

    // 2. Moderation check
    const modResult = await engine.moderationService.moderate(mockLibrary[0], mockLibrary);
    assert.strictEqual(modResult.isFlagged, false); // Safe

    // Corrupted Asset check
    const corruptAsset: any = {
      id: 'ast_corrupt',
      name: 'bad_file.mp4',
      checksum: '00000000000000000000000000000000',
      url: 'https://cdn.com/corrupt_file.mp4',
      metadata: { title: 'Untitled', fileType: 'mp4' },
    };

    const modResultBad = await engine.moderationService.moderate(corruptAsset, mockLibrary);
    assert.strictEqual(modResultBad.isFlagged, true);
    assert.ok(modResultBad.flagReasons.includes('corrupt_media'));
    assert.ok(modResultBad.flagReasons.includes('missing_metadata'));
  });

  test('Plugin Provider Extensibility support', async () => {
    const engine = new AssetIntelligenceEngine();

    const customProvider: EmbeddingProvider = {
      id: 'openai_v4',
      name: 'OpenAI Embeddings v4',
      dimensions: 1536,
      generateTextEmbedding: async (t) => new Array(1536).fill(0.5),
      generateImageEmbedding: async (url) => new Array(1536).fill(0.6),
      generateVideoEmbedding: async (url) => new Array(1536).fill(0.7),
    };

    engine.embeddingService.registerProvider(customProvider);
    engine.embeddingService.setActiveProvider('openai_v4');

    assert.strictEqual(engine.embeddingService.getActiveProvider()?.id, 'openai_v4');

    const textVector = await engine.embeddingService.generateTextEmbedding('Hello');
    assert.strictEqual(textVector.length, 1536);
    assert.strictEqual(textVector[0], 0.5);
  });

  test('Large Libraries scaling', async () => {
    const engine = new AssetIntelligenceEngine();

    // Generate 100 assets
    const largeLibrary: Asset[] = Array.from({ length: 100 }, (_, i) => ({
      id: `asset_${i}`,
      name: `Clip_${i}.mp4`,
      checksum: `checksum_${i}`,
      url: `https://cdn.com/clip_${i}.mp4`,
      metadata: {
        title: `Asset Title ${i}`,
        description: `Description of clip ${i}`,
        fileType: 'mp4',
        categories: [i % 2 === 0 ? 'Marketing' : 'Studio'],
      },
      license: { licenseType: 'commercial', attributionRequired: false, commercialUse: true },
      approval: { status: 'approved', history: [] },
      usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
      versions: [],
      collections: [],
    }));

    const embeddings = largeLibrary.map((asset, i) => ({
      assetId: asset.id,
      vector: [0.5 + i / 200, 0.5 - i / 200],
      provider: 'mock',
      dimensions: 2,
      createdAt: '',
    }));

    const start = Date.now();
    const results = await engine.searchService.search({ embedding: [0.5, 0.5], threshold: 0.1 }, largeLibrary, embeddings);
    const duration = Date.now() - start;

    assert.ok(duration < 200); // Must score and search 100 high-dimensional vectors in less than 200ms
    assert.ok(results.length > 0);
  });
});
