import { useBrandStore } from '../store/brandStore';
import { ThemeResolver } from '../services/ThemeResolver';
import { BrandKit } from '@ai-video-editor/shared';

export const useBrand = () => {
  const store = useBrandStore();

  const activeKit = store.brandKits.find(k => k.id === store.activeBrandKitId);
  const theme = activeKit ? ThemeResolver.resolve(activeKit) : null;

  return {
    brandKits: store.brandKits,
    activeKit,
    theme,
    setActiveBrandKit: store.setActiveBrandKit,
    addBrandKit: store.addBrandKit,
    updateBrandKit: store.updateBrandKit,
    removeBrandKit: store.removeBrandKit
  };
};
