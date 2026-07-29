import { z } from 'zod';
import { RenderArtifact } from '@ai-video-editor/shared';

// Export Formats
export type ExportFormat =
  | 'mp4'
  | 'mov'
  | 'webm'
  | 'mkv'
  | 'image_sequence'
  | 'gif'
  | 'animated_webp'
  | 'audio_only'
  | 'project_archive';

export const ExportFormatSchema = z.enum([
  'mp4',
  'mov',
  'webm',
  'mkv',
  'image_sequence',
  'gif',
  'animated_webp',
  'audio_only',
  'project_archive',
]);

// Video Codecs
export type VideoCodec = 'h264' | 'h265' | 'av1' | 'vp9' | 'prores' | 'dnxhd';

export const VideoCodecSchema = z.enum(['h264', 'h265', 'av1', 'vp9', 'prores', 'dnxhd']);

// Audio Codecs
export type AudioCodec = 'aac' | 'pcm' | 'flac' | 'opus' | 'mp3';

export const AudioCodecSchema = z.enum(['aac', 'pcm', 'flac', 'opus', 'mp3']);

// Packaging Formats
export type PackagingFormat = 'hls' | 'mpeg_dash' | 'cmaf' | 'zip_archive' | 'project_bundle' | 'asset_bundle';

export const PackagingFormatSchema = z.enum([
  'hls',
  'mpeg_dash',
  'cmaf',
  'zip_archive',
  'project_bundle',
  'asset_bundle',
]);

// Destination Types
export type DestinationType =
  | 'local'
  | 'network'
  | 'object_storage'
  | 'ftp_sftp'
  | 'cloud'
  | 'social'
  | 'broadcast';

export const DestinationTypeSchema = z.enum([
  'local',
  'network',
  'object_storage',
  'ftp_sftp',
  'cloud',
  'social',
  'broadcast',
]);

// Delivery Schedule Types
export type DeliveryScheduleType = 'immediate' | 'scheduled' | 'recurring' | 'conditional' | 'workflow';

export const DeliveryScheduleTypeSchema = z.enum([
  'immediate',
  'scheduled',
  'recurring',
  'conditional',
  'workflow',
]);

export interface DeliverySchedule {
  type: DeliveryScheduleType;
  scheduledTime?: string; // ISO String
  recurrenceCron?: string;
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt';
    value: string;
  }>;
  workflowTriggerId?: string;
}

export const DeliveryScheduleSchema = z.object({
  type: DeliveryScheduleTypeSchema,
  scheduledTime: z.string().optional(),
  recurrenceCron: z.string().optional(),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'gt', 'lt']),
        value: z.string(),
      })
    )
    .optional(),
  workflowTriggerId: z.string().optional(),
});

// Encoding Profile
export interface EncodingProfile {
  id: string;
  name: string;
  videoCodec?: VideoCodec;
  videoBitrateKbps?: number;
  fps?: number;
  resolution?: { width: number; height: number };
  aspectRatio?: string;
  audioCodec?: AudioCodec;
  audioBitrateKbps?: number;
  audioChannels?: number;
  sampleRateHz?: number;
  customSettings?: Record<string, any>;
}

export const EncodingProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  videoCodec: VideoCodecSchema.optional(),
  videoBitrateKbps: z.number().optional(),
  fps: z.number().optional(),
  resolution: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  aspectRatio: z.string().optional(),
  audioCodec: AudioCodecSchema.optional(),
  audioBitrateKbps: z.number().optional(),
  audioChannels: z.number().optional(),
  sampleRateHz: z.number().optional(),
  customSettings: z.record(z.string(), z.any()).optional(),
});

// Packaging Profile
export interface PackagingProfile {
  id: string;
  name: string;
  format: PackagingFormat;
  segmentDurationSeconds?: number;
  encryption?: Record<string, any>;
  customSettings?: Record<string, any>;
}

export const PackagingProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: PackagingFormatSchema,
  segmentDurationSeconds: z.number().optional(),
  encryption: z.record(z.string(), z.any()).optional(),
  customSettings: z.record(z.string(), z.any()).optional(),
});

// Destination
export interface Destination {
  id: string;
  name: string;
  type: DestinationType;
  config: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    delayMs: number;
  };
}

export const DestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: DestinationTypeSchema,
  config: z.record(z.string(), z.any()),
  retryPolicy: z
    .object({
      maxRetries: z.number(),
      delayMs: z.number(),
    })
    .optional(),
});

// QC Validation Rule
export interface QCRule {
  id: string;
  type:
    | 'missing_assets'
    | 'broken_references'
    | 'frame_drops'
    | 'resolution'
    | 'frame_rate'
    | 'aspect_ratio'
    | 'audio_clipping'
    | 'loudness'
    | 'subtitle_timing'
    | 'color_space_consistency';
  severity: 'info' | 'warning' | 'error';
  params?: Record<string, any>;
}

export const QCRuleSchema = z.object({
  id: z.string(),
  type: z.enum([
    'missing_assets',
    'broken_references',
    'frame_drops',
    'resolution',
    'frame_rate',
    'aspect_ratio',
    'audio_clipping',
    'loudness',
    'subtitle_timing',
    'color_space_consistency',
  ]),
  severity: z.enum(['info', 'warning', 'error']),
  params: z.record(z.string(), z.any()).optional(),
});

// QC Violation
export interface QCViolation {
  ruleId: string;
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

export const QCViolationSchema = z.object({
  ruleId: z.string(),
  type: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
  message: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

// Quality Report
export interface QualityReport {
  id: string;
  jobId: string;
  isValid: boolean;
  score: number; // 0-100
  violations: QCViolation[];
  metrics: {
    missingAssets: string[];
    brokenReferences: string[];
    frameDrops: number;
    resolutionMatch: boolean;
    fpsMatch: boolean;
    aspectRatioMatch: boolean;
    clippingEvents: number;
    loudnessLUFS?: number;
    subtitleOutOfSyncCount: number;
    colorSpaceConsistent: boolean;
  };
  checkedAt: string;
}

export const QualityReportSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  isValid: z.boolean(),
  score: z.number().min(0).max(100),
  violations: z.array(QCViolationSchema),
  metrics: z.object({
    missingAssets: z.array(z.string()),
    brokenReferences: z.array(z.string()),
    frameDrops: z.number(),
    resolutionMatch: z.boolean(),
    fpsMatch: z.boolean(),
    aspectRatioMatch: z.boolean(),
    clippingEvents: z.number(),
    loudnessLUFS: z.number().optional(),
    subtitleOutOfSyncCount: z.number(),
    colorSpaceConsistent: z.boolean(),
  }),
  checkedAt: z.string(),
});

// Export Preset
export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  encodingProfile: EncodingProfile;
  packagingProfile?: PackagingProfile;
  destinations: Destination[];
  qcRules?: QCRule[];
}

export const ExportPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  format: ExportFormatSchema,
  encodingProfile: EncodingProfileSchema,
  packagingProfile: PackagingProfileSchema.optional(),
  destinations: z.array(DestinationSchema),
  qcRules: z.array(QCRuleSchema).optional(),
});

// Media Package
export interface MediaPackage {
  id: string;
  manifestId: string;
  format: string; // e.g. 'mp4', 'hls'
  files: Array<{
    path: string;
    size: number;
    checksum: string;
  }>;
  createdAt: string;
}

export const MediaPackageSchema = z.object({
  id: z.string(),
  manifestId: z.string(),
  format: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      size: z.number(),
      checksum: z.string(),
    })
  ),
  createdAt: z.string(),
});

// Delivery Manifest
export interface DeliveryManifest {
  id: string;
  jobId: string;
  mediaPackages: MediaPackage[];
  metadata: Record<string, any>;
  createdAt: string;
}

export const DeliveryManifestSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  mediaPackages: z.array(MediaPackageSchema),
  metadata: z.record(z.string(), z.any()),
  createdAt: z.string(),
});

// Distribution Task
export interface DistributionTask {
  id: string;
  jobId: string;
  destinationId: string;
  status: 'queued' | 'uploading' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
  retryCount: number;
  bandwidthBytesPerSec?: number;
  etaSeconds?: number;
  startedAt?: string;
  completedAt?: string;
}

export const DistributionTaskSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  destinationId: z.string(),
  status: z.enum(['queued', 'uploading', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  retryCount: z.number(),
  bandwidthBytesPerSec: z.number().optional(),
  etaSeconds: z.number().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

// Delivery Job
export interface DeliveryJob {
  id: string;
  projectId: string;
  renderArtifactId: string;
  presetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  manifest?: DeliveryManifest;
  qualityReport?: QualityReport;
  distributionTasks: DistributionTask[];
  schedule?: DeliverySchedule;
}

export const DeliveryJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  renderArtifactId: z.string(),
  presetId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  manifest: DeliveryManifestSchema.optional(),
  qualityReport: QualityReportSchema.optional(),
  distributionTasks: z.array(DistributionTaskSchema),
  schedule: DeliveryScheduleSchema.optional(),
});

// Delivery Result
export interface DeliveryResult {
  id: string;
  jobId: string;
  status: 'success' | 'failure';
  manifestUrl?: string;
  qualityScore?: number;
  errors?: string[];
  completedAt: string;
}

export const DeliveryResultSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: z.enum(['success', 'failure']),
  manifestUrl: z.string().optional(),
  qualityScore: z.number().optional(),
  errors: z.array(z.string()).optional(),
  completedAt: z.string(),
});

// Provider Adapter Interfaces for Plugin Support
export interface ExporterAdapter {
  id: string;
  name: string;
  supportedFormats: ExportFormat[];
  export(artifact: RenderArtifact, format: ExportFormat, options?: any): Promise<{ outputPath: string; size: number }>;
}

export interface EncoderAdapter {
  id: string;
  name: string;
  supportedVideoCodecs: VideoCodec[];
  supportedAudioCodecs: AudioCodec[];
  encode(inputPath: string, profile: EncodingProfile): Promise<{ outputPath: string; size: number }>;
}

export interface PackagerAdapter {
  id: string;
  name: string;
  supportedFormats: PackagingFormat[];
  package(inputPath: string, profile: PackagingProfile): Promise<MediaPackage>;
}

export interface DeliveryProviderAdapter {
  id: string;
  name: string;
  supportedTypes: DestinationType[];
  deliver(
    mediaPackage: MediaPackage,
    destination: Destination,
    onProgress?: (progress: number, bandwidthBytesPerSec?: number, etaSeconds?: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }>;
}

export interface QCValidatorAdapter {
  id: string;
  name: string;
  validate(artifact: RenderArtifact, rules: QCRule[]): Promise<QualityReport>;
}
