import { MediaAsset as SharedMediaAsset, MediaFolder as SharedMediaFolder, MediaFilter as SharedMediaFilter } from '@ai-video-editor/shared';

export type MediaAsset = SharedMediaAsset;
export type MediaFolder = SharedMediaFolder;
export type MediaFilter = SharedMediaFilter;

export interface MediaState {
  assets: MediaAsset[];
  folders: MediaFolder[];
  selectedAssetId: string | null;
  selectedFolderId: string | null;
  search: string;
  filters: MediaFilter;
  loading: boolean;
  error: string | null;
}
