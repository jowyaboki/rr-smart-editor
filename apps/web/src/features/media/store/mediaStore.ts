import { pipeline } from "@/features/pipeline/services/EventPipeline";
import { create } from 'zustand';
import { MediaAsset, MediaFolder, MediaFilter } from '../types';
import { MediaRepository, LocalStorageMediaRepository } from '../services/MediaRepository';
import { ThumbnailService } from '../services/ThumbnailService';
import { MetadataService } from '../services/MetadataService';
import { MediaValidationService } from '../services/MediaValidationService';

interface MediaStore {
  assets: MediaAsset[];
  folders: MediaFolder[];
  selectedAssetId: string | null;
  selectedFolderId: string | null;
  search: string;
  filters: MediaFilter;
  loading: boolean;
  error: string | null;
  repository: MediaRepository;

  fetchMedia: () => Promise<void>;
  importAssets: (files: File[]) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  renameAsset: (id: string, name: string) => Promise<void>;
  moveAsset: (assetId: string, folderId: string | null) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  selectAsset: (id: string | null) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: MediaFilter) => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  assets: [],
  folders: [],
  selectedAssetId: null,
  selectedFolderId: null,
  search: '',
  filters: {},
  loading: false,
  error: null,
  repository: new LocalStorageMediaRepository(),

  fetchMedia: async () => {
    set({ loading: true });
    try {
      const assets = await get().repository.getAssets();
      const folders = await get().repository.getFolders();
      set({ assets, folders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  importAssets: async (files) => {
    set({ loading: true });
    try {
      for (const file of files) {
        const type = MediaValidationService.getAssetType(file.type, file.name);
        const thumbnail = await ThumbnailService.getFileThumbnail(file, type);
        const metadata = await MetadataService.getMetadata(file, type);

        // For LocalStorage, we use base64 for URL (simple but limited)
        const url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const newAsset: MediaAsset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          filename: file.name,
          type,
          mimeType: file.type,
          size: file.size,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          thumbnail,
          url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          favorite: false,
          folderId: get().selectedFolderId,
          metadata: metadata,
        };
        await get().repository.saveAsset(newAsset);
      }
      await get().fetchMedia();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  removeAsset: async (id) => {
    await get().repository.deleteAsset(id);
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));
  },

  renameAsset: async (id, name) => {
    const updated = await get().repository.updateAsset(id, { name });
    set((state) => ({ assets: state.assets.map((a) => (a.id === id ? updated : a)) }));
  },

  moveAsset: async (assetId, folderId) => {
    await get().repository.moveAsset(assetId, folderId);
    await get().fetchMedia();
  },

  toggleFavorite: async (id) => {
    const asset = get().assets.find((a) => a.id === id);
    if (asset) {
      const updated = await get().repository.updateAsset(id, { favorite: !asset.favorite });
      set((state) => ({ assets: state.assets.map((a) => (a.id === id ? updated : a)) }));
    }
  },

  createFolder: async (name, parentId = null) => {
    const newFolder: MediaFolder = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await get().repository.createFolder(newFolder);
    await get().fetchMedia();
  },

  deleteFolder: async (id) => {
    await get().repository.deleteFolder(id);
    await get().fetchMedia();
  },

  selectAsset: (id) => set({ selectedAssetId: id }),
  setSearch: (search) => set({ search }),
  setFilters: (filters) => set({ filters }),
}));
