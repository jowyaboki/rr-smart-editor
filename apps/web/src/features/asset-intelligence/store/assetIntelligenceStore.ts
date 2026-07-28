import { create } from 'zustand';
import { Asset } from '@ai-video-editor/dam';
import {
  SearchQuery,
  SearchResult,
  Recommendation,
  AssetCluster,
  ClusterCriteria,
  ModerationResult,
  AssetIntelligenceEngine,
} from '@ai-video-editor/asset-intelligence';

const localEngine = new AssetIntelligenceEngine();

// Client side library store for sandbox execution
const clientLibrary: Asset[] = [
  {
    id: 'as_web_promo',
    name: 'Dynamic Promo Explainer.mp4',
    checksum: 'checksum_web_promo_1',
    url: 'https://cdn.server.com/promo_1.mp4',
    metadata: {
      title: 'Dynamic Promo Explainer Video',
      description: 'Flat vector elements and upbeat corporate sound',
      keywords: ['promo', 'flat', 'vector'],
      categories: ['Marketing'],
      author: 'Web Admin',
      fileType: 'mp4',
      dominantColors: ['#3b82f6', '#10b981'],
    },
    license: { licenseType: 'commercial', attributionRequired: false, commercialUse: true },
    approval: { status: 'approved', history: [] },
    usage: { projectsUsedIn: ['proj_web_1'], scenesCount: 1, timelineClipsCount: 2, templatesUsedIn: [], publishedVideos: [] },
    versions: [],
    collections: [],
  },
  {
    id: 'as_web_audio',
    name: 'Chill Ambient Synth.wav',
    checksum: 'checksum_web_audio_1',
    url: 'https://cdn.server.com/ambient_1.wav',
    metadata: {
      title: 'Chill Ambient Synth Track',
      description: 'Relaxed spacey background pads',
      keywords: ['chill', 'synth', 'ambient'],
      categories: ['Audio'],
      author: 'Sound Architect',
      fileType: 'wav',
    },
    license: { licenseType: 'royalty_free', attributionRequired: false, commercialUse: true },
    approval: { status: 'approved', history: [] },
    usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
    versions: [],
    collections: [],
  },
  {
    id: 'as_web_broll_sunset',
    name: 'Sunset Beach Loop.mov',
    checksum: 'checksum_sunset_1',
    url: 'https://cdn.server.com/sunset.mov',
    metadata: {
      title: 'Cinematic Sunset Beach B-Roll',
      description: 'Golden hour slow motion ocean waves',
      keywords: ['sunset', 'beach', 'sea', 'nature'],
      categories: ['Marketing'],
      author: 'Cinematographer',
      fileType: 'mov',
      dominantColors: ['#f59e0b', '#ef4444'],
    },
    license: { licenseType: 'commercial', attributionRequired: true, commercialUse: true },
    approval: { status: 'approved', history: [] },
    usage: { projectsUsedIn: [], scenesCount: 0, timelineClipsCount: 0, templatesUsedIn: [], publishedVideos: [] },
    versions: [],
    collections: [],
  }
];

const clientEmbeddings = [
  { assetId: 'as_web_promo', vector: [0.85, 0.15, 0.0], provider: 'mock', dimensions: 3, createdAt: '' },
  { assetId: 'as_web_audio', vector: [0.05, 0.05, 0.9], provider: 'mock', dimensions: 3, createdAt: '' },
  { assetId: 'as_web_broll_sunset', vector: [0.75, 0.1, 0.15], provider: 'mock', dimensions: 3, createdAt: '' },
];

interface AssetIntelligenceState {
  library: Asset[];
  searchQuery: SearchQuery;
  searchResults: SearchResult[];
  activeAsset: Asset | null;
  recommendations: Recommendation[];
  clusters: AssetCluster[];
  moderationResult: ModerationResult | null;
  isLoading: boolean;

  // Actions
  setSearchQuery: (query: Partial<SearchQuery>) => void;
  performSearch: () => Promise<void>;
  inspectAsset: (assetId: string) => Promise<void>;
  clusterLibrary: (criteria: ClusterCriteria) => Promise<void>;
  analyzeAsset: (assetId: string) => Promise<void>;
}

export const useAssetIntelligenceStore = create<AssetIntelligenceState>((set, get) => {
  return {
    library: clientLibrary,
    searchQuery: {
      text: '',
      threshold: 0.25,
      hybridWeight: 0.5,
    },
    searchResults: [],
    activeAsset: null,
    recommendations: [],
    clusters: [],
    moderationResult: null,
    isLoading: false,

    setSearchQuery: (query) => {
      set(state => ({ searchQuery: { ...state.searchQuery, ...query } }));
    },

    performSearch: async () => {
      const { searchQuery, library } = get();
      set({ isLoading: true });
      try {
        const results = await localEngine.searchService.search(searchQuery, library, clientEmbeddings);
        set({ searchResults: results });
      } catch (err) {
        console.error('Semantic search failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    inspectAsset: async (assetId) => {
      const { library } = get();
      const asset = library.find(a => a.id === assetId);
      if (!asset) return;

      set({ activeAsset: asset, isLoading: true, recommendations: [], moderationResult: null });
      try {
        const recs = await localEngine.recommendationService.recommend(asset, library, clientEmbeddings);
        const mod = await localEngine.moderationService.moderate(asset, library);
        set({ recommendations: recs, moderationResult: mod });
      } catch (err) {
        console.error('Asset inspection analytics failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    clusterLibrary: async (criteria) => {
      const { library } = get();
      set({ isLoading: true });
      try {
        const clus = await localEngine.clusteringService.cluster(library, clientEmbeddings, criteria);
        set({ clusters: clus });
      } catch (err) {
        console.error('Semantic clustering failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    analyzeAsset: async (assetId) => {
      const { library } = get();
      const asset = library.find(a => a.id === assetId);
      if (!asset) return;

      set({ isLoading: true });
      try {
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
        const analysis = await localEngine.analyzeAndIndexAsset(asset, 'client_index', profile, library);

        // Update active asset details on success
        set({
          activeAsset: { ...asset },
          moderationResult: analysis.moderatedAt ? analysis : get().moderationResult,
        });

        // Refresh searches
        await get().performSearch();
      } catch (err) {
        console.error('Asset intelligence AI analysis failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },
  };
});
