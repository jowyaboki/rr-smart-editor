import { create } from 'zustand';
import {
  BrandKit,
  BrandFont,
  BrandLogo,
  BrandPalette
} from '@ai-video-editor/shared';

interface BrandState {
  brandKits: BrandKit[];
  activeBrandKitId: string | null;

  addBrandKit: (kit: BrandKit) => void;
  updateBrandKit: (id: string, updates: Partial<BrandKit>) => void;
  removeBrandKit: (id: string) => void;
  setActiveBrandKit: (id: string | null) => void;

  // Specific asset management helpers
  addPalette: (kitId: string, palette: BrandPalette) => void;
  addFont: (kitId: string, font: BrandFont) => void;
  addLogo: (kitId: string, logo: BrandLogo) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brandKits: [],
  activeBrandKitId: null,

  addBrandKit: (kit) => set((state) => ({
    brandKits: [...state.brandKits, kit]
  })),

  updateBrandKit: (id, updates) => set((state) => ({
    brandKits: state.brandKits.map(kit => kit.id === id ? { ...kit, ...updates } : kit)
  })),

  removeBrandKit: (id) => set((state) => ({
    brandKits: state.brandKits.filter(kit => kit.id !== id),
    activeBrandKitId: state.activeBrandKitId === id ? null : state.activeBrandKitId
  })),

  setActiveBrandKit: (id) => set({ activeBrandKitId: id }),

  addPalette: (kitId, palette) => set((state) => ({
    brandKits: state.brandKits.map(kit =>
      kit.id === kitId ? { ...kit, palettes: [...kit.palettes, palette] } : kit
    )
  })),

  addFont: (kitId, font) => set((state) => ({
    brandKits: state.brandKits.map(kit =>
      kit.id === kitId ? { ...kit, fonts: [...kit.fonts, font] } : kit
    )
  })),

  addLogo: (kitId, logo) => set((state) => ({
    brandKits: state.brandKits.map(kit =>
      kit.id === kitId ? { ...kit, logos: [...kit.logos, logo] } : kit
    )
  })),
}));
