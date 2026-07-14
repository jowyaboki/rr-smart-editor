export type MediaAssetType = 'image' | 'video' | 'audio' | 'svg' | 'gif' | 'lottie' | 'font';

export interface MediaAsset {
  id: string;
  name: string;
  filename: string;
  type: MediaAssetType;
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  thumbnail?: string;
  url: string; // The source URL or base64
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
  folderId: string | null;
  metadata: Record<string, any>;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCollection {
  id: string;
  name: string;
  assetIds: string[];
}

export interface MediaFilter {
  type?: MediaAssetType[];
  tags?: string[];
  favorite?: boolean;
  search?: string;
  dateRange?: { start: string; end: string };
}
