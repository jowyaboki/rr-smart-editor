import { create } from 'zustand';
import { WebDAMAsset } from '../types';

export interface DAMState {
  assets: WebDAMAsset[];
  selectedFolderId: string | null;
  searchQuery: string;
  categoryFilter: string;
  loading: boolean;

  // Actions
  setAssets: (assets: WebDAMAsset[]) => void;
  selectFolder: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  togglePin: (id: string) => void;
  updateAssetStatus: (id: string, status: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useDAMStore = create<DAMState>((set) => ({
  assets: [
    {
      id: 'dam-asset-1',
      displayName: 'Premium Intro Loop.mp4',
      category: 'video',
      status: 'draft',
      url: 'https://cdn.example.com/assets/premium-intro.mp4',
      isPinned: false,
    },
    {
      id: 'dam-asset-2',
      displayName: 'Corporate Voiceover.wav',
      category: 'audio',
      status: 'in_review',
      url: 'https://cdn.example.com/assets/corp-voiceover.wav',
      isPinned: true,
    },
    {
      id: 'dam-asset-3',
      displayName: 'High-Res Studio Logo.png',
      category: 'image',
      status: 'approved',
      url: 'https://cdn.example.com/assets/studio-logo.png',
      isPinned: false,
    }
  ],
  selectedFolderId: null,
  searchQuery: '',
  categoryFilter: 'all',
  loading: false,

  setAssets: (assets) => set({ assets }),

  selectFolder: (selectedFolderId) => set({ selectedFolderId }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  togglePin: (id) => set((state) => ({
    assets: state.assets.map((a) =>
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    ),
  })),

  updateAssetStatus: (id, status) => set((state) => ({
    assets: state.assets.map((a) => (a.id === id ? { ...a, status } : a)),
  })),

  setLoading: (loading) => set({ loading }),
}));
