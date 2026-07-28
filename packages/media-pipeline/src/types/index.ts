import { z } from 'zod';

export type MediaAssetType = 'video' | 'audio' | 'image' | string;

export const MediaAssetTypeSchema = z.enum(['video', 'audio', 'image']);

export interface MediaMetadata {
  resolution?: { width: number; height: number };
  duration?: number;      // duration in seconds
  fps?: number;
  codec?: string;
  bitrate?: number;       // in kbps
  audioChannels?: number;
  colorSpace?: string;
  aspectRatio?: string;
  rotation?: number;
  embeddedMetadata?: Record<string, any>;
  checksum: string;       // fingerprint checksum hash
}

export const MediaMetadataSchema = z.object({
  resolution: z.object({ width: z.number(), height: z.number() }).optional(),
  duration: z.number().nonnegative().optional(),
  fps: z.number().positive().optional(),
  codec: z.string().optional(),
  bitrate: z.number().positive().optional(),
  audioChannels: z.number().nonnegative().optional(),
  colorSpace: z.string().optional(),
  aspectRatio: z.string().optional(),
  rotation: z.number().optional(),
  embeddedMetadata: z.record(z.any()).optional(),
  checksum: z.string().min(1),
});

export interface ProxyAsset {
  id: string;
  assetId: string;
  quality: 'low' | 'medium';
  filepath: string;
  size: number;
  status: 'pending' | 'completed' | 'failed';
}

export const ProxyAssetSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  quality: z.enum(['low', 'medium']),
  filepath: z.string(),
  size: z.number().nonnegative(),
  status: z.enum(['pending', 'completed', 'failed']),
});

export interface ThumbnailAsset {
  id: string;
  assetId: string;
  filepath: string;
  posterFrameOffsetSec: number;
}

export const ThumbnailAssetSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  filepath: z.string(),
  posterFrameOffsetSec: z.number().nonnegative(),
});

export interface WaveformAsset {
  id: string;
  assetId: string;
  peaks: number[]; // normalized peaks [0.0 to 1.0]
  channels: number;
}

export const WaveformAssetSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  peaks: z.array(z.number()),
  channels: z.number().positive(),
});

export interface MediaAsset {
  id: string;
  filename: string;
  filepath: string;
  type: MediaAssetType;
  size: number; // in bytes
  fingerprint: string; // MD5/SHA256 checksum
  metadata: MediaMetadata;
  collectionId?: string;
  proxy?: {
    low?: ProxyAsset;
    medium?: ProxyAsset;
  };
  thumbnail?: ThumbnailAsset;
  waveform?: WaveformAsset;
}

export const MediaAssetSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  filepath: z.string(),
  type: z.string(),
  size: z.number().positive(),
  fingerprint: z.string().min(1),
  metadata: MediaMetadataSchema,
  collectionId: z.string().optional(),
  proxy: z.object({
    low: ProxyAssetSchema.optional(),
    medium: ProxyAssetSchema.optional(),
  }).optional(),
  thumbnail: ThumbnailAssetSchema.optional(),
  waveform: WaveformAssetSchema.optional(),
});

export interface MediaCollection {
  id: string;
  name: string;
  tags?: string[];
}

export const MediaCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()).optional(),
});

export type JobStatus = 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface ImportJob {
  id: string;
  assetId: string;
  filename: string;
  status: JobStatus;
  progress: number; // 0 to 100
  retries: number;
  error?: string;
}

export const ImportJobSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  filename: z.string(),
  status: z.enum(['queued', 'processing', 'paused', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(100),
  retries: z.number().nonnegative(),
  error: z.string().optional(),
});
