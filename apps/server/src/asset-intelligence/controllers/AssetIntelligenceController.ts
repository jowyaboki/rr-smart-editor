import { Request, Response } from 'express';
import { globalAssetIntelligenceEngine } from '@ai-video-editor/asset-intelligence';
import { Asset } from '@ai-video-editor/dam';

// In-memory database of mock assets and semantic embeddings for server runtime
const serverLibrary: Asset[] = [
  {
    id: 'asset_server_promo',
    name: 'Dynamic Promo Explainer.mp4',
    checksum: 'checksum_server_promo_1',
    url: 'https://cdn.server.com/promo_1.mp4',
    metadata: {
      title: 'Dynamic Promo Explainer Video',
      description: 'Flat vector elements and upbeat corporate sound',
      keywords: ['promo', 'flat', 'vector'],
      categories: ['marketing'],
      author: 'Server Admin',
      fileType: 'mp4',
      dominantColors: ['#3b82f6', '#10b981'],
    },
    license: { licenseType: 'commercial', attributionRequired: false, commercialUse: true },
    approval: { status: 'approved', history: [] },
    usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
    versions: [],
    collections: [],
  },
  {
    id: 'asset_server_audio',
    name: 'Chill Ambient Synth.wav',
    checksum: 'checksum_server_audio_1',
    url: 'https://cdn.server.com/ambient_1.wav',
    metadata: {
      title: 'Chill Ambient Synth Track',
      description: 'Relaxed spacey background pads',
      keywords: ['chill', 'synth', 'ambient'],
      categories: ['audio'],
      author: 'Sound Engineer',
      fileType: 'wav',
    },
    license: { licenseType: 'royalty_free', attributionRequired: false, commercialUse: true },
    approval: { status: 'approved', history: [] },
    usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
    versions: [],
    collections: [],
  }
];

const serverEmbeddings = [
  { assetId: 'asset_server_promo', vector: [0.85, 0.15, 0.05, 0.0], provider: 'openai', dimensions: 4, createdAt: new Date().toISOString() },
  { assetId: 'asset_server_audio', vector: [0.05, 0.05, 0.9, 0.1], provider: 'openai', dimensions: 4, createdAt: new Date().toISOString() }
];

export class AssetIntelligenceController {

  public async search(req: Request, res: Response): Promise<void> {
    try {
      const query = req.body;
      const results = await globalAssetIntelligenceEngine.searchService.search(
        query,
        serverLibrary,
        serverEmbeddings
      );
      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async cluster(req: Request, res: Response): Promise<void> {
    try {
      const { criteria } = req.body;
      const clusters = await globalAssetIntelligenceEngine.clusteringService.cluster(
        serverLibrary,
        serverEmbeddings,
        criteria || 'topic'
      );
      res.json({ success: true, clusters });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async recommendations(req: Request, res: Response): Promise<void> {
    try {
      const { assetId } = req.body;
      const targetAsset = serverLibrary.find(a => a.id === assetId);
      if (!targetAsset) {
        res.status(404).json({ success: false, error: `Asset '${assetId}' not found.` });
        return;
      }
      const recommendations = await globalAssetIntelligenceEngine.recommendationService.recommend(
        targetAsset,
        serverLibrary,
        serverEmbeddings
      );
      res.json({ success: true, recommendations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async moderate(req: Request, res: Response): Promise<void> {
    try {
      const { assetId } = req.body;
      const targetAsset = serverLibrary.find(a => a.id === assetId);
      if (!targetAsset) {
        res.status(404).json({ success: false, error: `Asset '${assetId}' not found.` });
        return;
      }
      const result = await globalAssetIntelligenceEngine.moderationService.moderate(
        targetAsset,
        serverLibrary
      );
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async analyzeAndIndex(req: Request, res: Response): Promise<void> {
    try {
      const { assetId, profile } = req.body;
      const targetAsset = serverLibrary.find(a => a.id === assetId);
      if (!targetAsset) {
        res.status(404).json({ success: false, error: `Asset '${assetId}' not found.` });
        return;
      }
      const defaultProfile = {
        extractVisualConcepts: true,
        extractObjects: true,
        extractFaces: false,
        extractScenes: false,
        extractActivities: false,
        extractLogos: false,
        extractOcrText: false,
        extractSpeechTranscript: false,
        extractMusicMood: false,
        extractDominantColors: false,
        extractEmotionTags: false,
        extractLanguage: false,
        ...profile
      };

      const result = await globalAssetIntelligenceEngine.analyzeAndIndexAsset(
        targetAsset,
        'server_main_index',
        defaultProfile,
        serverLibrary
      );
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const assetIntelligenceController = new AssetIntelligenceController();
