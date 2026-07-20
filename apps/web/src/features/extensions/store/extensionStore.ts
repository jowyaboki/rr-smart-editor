import { create } from 'zustand';
import { WebExtension } from '../types';

export interface ExtensionState {
  extensions: WebExtension[];
  searchQuery: string;
  categoryFilter: string;
  loading: boolean;

  // Actions
  setExtensions: (extensions: WebExtension[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  toggleInstalled: (id: string) => void;
  toggleEnabled: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useExtensionStore = create<ExtensionState>((set) => ({
  extensions: [
    {
      id: 'ext-youtube',
      name: 'youtube-publisher',
      displayName: 'YouTube Publishing Adapter',
      description: 'Allows publishing direct exports to YouTube with caption integrations.',
      version: '1.2.0',
      category: 'publishing_adapter',
      installed: false,
      enabled: false,
      downloads: 4200,
      rating: 4.7,
    },
    {
      id: 'ext-transitions',
      name: 'transition-pack-v1',
      displayName: 'Premium Transitions Pack',
      description: 'Adds 50+ beautiful modern camera slide and zoom transitions.',
      version: '1.0.0',
      category: 'transition',
      installed: false,
      enabled: false,
      downloads: 8900,
      rating: 4.9,
    },
    {
      id: 'ext-twitch',
      name: 'twitch-connector',
      displayName: 'Twitch Clip Connector',
      description: 'Ingest and edit clips directly from Twitch streams.',
      version: '1.0.1',
      category: 'data_connector',
      installed: true,
      enabled: true,
      downloads: 1200,
      rating: 4.5,
    }
  ],
  searchQuery: '',
  categoryFilter: 'all',
  loading: false,

  setExtensions: (extensions) => set({ extensions }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  toggleInstalled: (id) => set((state) => ({
    extensions: state.extensions.map((e) =>
      e.id === id ? { ...e, installed: !e.installed, enabled: !e.installed ? true : false } : e
    ),
  })),

  toggleEnabled: (id) => set((state) => ({
    extensions: state.extensions.map((e) =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ),
  })),

  setLoading: (loading) => set({ loading }),
}));
