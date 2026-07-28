import { create } from 'zustand';
import { MediaAsset, ImportJob, MediaCollection, JobStatus } from '../types';
import { MediaImportService, AnalysisService, ProxyService, ThumbnailService, WaveformService } from '@ai-video-editor/media-pipeline';

interface MediaStoreState {
  assets: MediaAsset[];
  collections: MediaCollection[];
  jobs: Record<string, ImportJob>;

  // Search index states
  searchQuery: string;
  selectedCollectionId: string | null;
  selectedType: string | null; // 'video', 'audio', 'image'
  selectedColorLabel: string | null;

  // Actions
  setSearchQuery: (q: string) => void;
  selectCollection: (id: string | null) => void;
  selectType: (type: string | null) => void;
  selectColorLabel: (color: string | null) => void;

  // Pipeline ingest operations
  importFile: (filename: string, size: number, filepath: string) => Promise<void>;
  createCollection: (collection: MediaCollection) => void;
}

export const useMediaStore = create<MediaStoreState>((set, get) => {
  return {
    assets: [],
    collections: [
      { id: 'all', name: 'All Media' },
      { id: 'renders', name: 'Renders Outputs' },
      { id: 'b_roll', name: 'B-Roll Footage', tags: ['scenery', 'vlog'] },
    ],
    jobs: {},

    searchQuery: '',
    selectedCollectionId: null,
    selectedType: null,
    selectedColorLabel: null,

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    selectCollection: (selectedCollectionId) => set({ selectedCollectionId }),
    selectType: (selectedType) => set({ selectedType }),
    selectColorLabel: (selectedColorLabel) => set({ selectedColorLabel }),

    importFile: async (filename, size, filepath) => {
      // 1. Ingest background job creation
      let job: ImportJob;
      try {
        job = MediaImportService.createImportJob(filename, size, filepath);
      } catch (err: any) {
        alert(err.message);
        return;
      }

      set(state => ({
        jobs: { ...state.jobs, [job.id]: { ...job, status: 'processing', progress: 10 } },
      }));

      // Simulate step-by-step ingestion stages (non-blocking)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        // Analysis stage
        await sleep(150);
        const fingerprint = MediaImportService.generateFingerprint(filename, size);
        const metadata = AnalysisService.analyzeMedia(filepath, filename, size, fingerprint);

        set(state => ({
          jobs: { ...state.jobs, [job.id]: { ...state.jobs[job.id], progress: 40 } },
        }));

        // Proxy, thumbnail, waveform generate stage
        await sleep(150);
        const lowProxy = await ProxyService.generateProxy(job.assetId, 'low', filepath);
        const thumbnail = await ThumbnailService.generateThumbnail(job.assetId, filepath);

        let waveform = undefined;
        if (filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.mp3')) {
          waveform = await WaveformService.generateWaveform(job.assetId, filepath);
        }

        set(state => ({
          jobs: { ...state.jobs, [job.id]: { ...state.jobs[job.id], progress: 80 } },
        }));

        // Asset assembling & registration
        await sleep(100);
        const asset: MediaAsset = {
          id: job.assetId,
          filename,
          filepath,
          type: filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'audio' : filename.endsWith('.png') || filename.endsWith('.jpg') ? 'image' : 'video',
          size,
          fingerprint,
          metadata,
          proxy: { low: lowProxy },
          thumbnail,
          waveform,
          collectionId: get().selectedCollectionId || 'all',
        };

        MediaImportService.registerAsset(asset);

        set(state => {
          const updatedJobs = { ...state.jobs };
          updatedJobs[job.id] = { ...updatedJobs[job.id], status: 'completed', progress: 100 };
          return {
            assets: [...state.assets, asset],
            jobs: updatedJobs,
          };
        });
      } catch (err: any) {
        set(state => {
          const updatedJobs = { ...state.jobs };
          updatedJobs[job.id] = { ...updatedJobs[job.id], status: 'failed', error: err.message || String(err) };
          return { jobs: updatedJobs };
        });
      }
    },

    createCollection: (col) => {
      set(state => ({ collections: [...state.collections, col] }));
    },
  };
});
export { MediaImportService };
