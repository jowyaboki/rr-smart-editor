import { MediaAsset } from '@/features/media/types';

export const AssetResolverService = {
  resolveUrl(asset: MediaAsset | undefined): string {
    if (!asset) return 'https://via.placeholder.com/1920x1080?text=Asset+Not+Found';
    return asset.url;
  },

  getPlaceholder(type: string): string {
    return `https://via.placeholder.com/1920x1080?text=Missing+${type}`;
  }
};
