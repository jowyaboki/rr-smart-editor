import { z } from 'zod';

// Technical/Standard Metadata schemas
export interface TechnicalMetadata {
  duration?: number;
  resolution?: { width: number; height: number };
  fps?: number;
  codec?: string;
  bitrate?: number;
  aspectRatio?: string;
  size: number;
  mimeType: string;
}

export const TechnicalMetadataSchema = z.object({
  duration: z.number().optional(),
  resolution: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  fps: z.number().optional(),
  codec: z.string().optional(),
  bitrate: z.number().optional(),
  aspectRatio: z.string().optional(),
  size: z.number(),
  mimeType: z.string(),
});

// Rights Management models
export interface License {
  id: string;
  type: string; // e.g. CC-BY, proprietary, editorial
  owner: string;
  allowedTerritories: string[]; // e.g. ['US', 'EU']
  expirationDate?: string; // ISO string
  usageRestrictions?: string[];
  copyrightText?: string;
  attributionText?: string;
}

export const LicenseSchema = z.object({
  id: z.string(),
  type: z.string(),
  owner: z.string(),
  allowedTerritories: z.array(z.string()),
  expirationDate: z.string().optional(),
  usageRestrictions: z.array(z.string()).optional(),
  copyrightText: z.string().optional(),
  attributionText: z.string().optional(),
});

export interface MediaRights {
  assetId: string;
  license: License;
  approvalStatus: 'pending' | 'cleared' | 'expired' | 'restricted';
  updatedAt: string;
}

export const MediaRightsSchema = z.object({
  assetId: z.string(),
  license: LicenseSchema,
  approvalStatus: z.enum(['pending', 'cleared', 'expired', 'restricted']),
  updatedAt: z.string(),
});

// Metadata Profile
export interface MetadataProfile {
  id: string;
  name: string;
  exif?: Record<string, any>;
  iptc?: Record<string, any>;
  xmp?: Record<string, any>;
  aiGeneratedTags?: string[];
  customMetadata?: Record<string, any>;
  tagsInheritedFromFolder?: boolean;
}

export const MetadataProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  exif: z.record(z.string(), z.any()).optional(),
  iptc: z.record(z.string(), z.any()).optional(),
  xmp: z.record(z.string(), z.any()).optional(),
  aiGeneratedTags: z.array(z.string()).optional(),
  customMetadata: z.record(z.string(), z.any()).optional(),
  tagsInheritedFromFolder: z.boolean().optional(),
});

// Relationships
export interface AssetRelationship {
  sourceAssetId: string;
  targetAssetId: string;
  type: 'derived' | 'source' | 'proxy' | 'thumbnail' | 'alternate';
}

export const AssetRelationshipSchema = z.object({
  sourceAssetId: z.string(),
  targetAssetId: z.string(),
  type: z.enum(['derived', 'source', 'proxy', 'thumbnail', 'alternate']),
});

// Versions
export interface AssetVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  url: string;
  size: number;
  checksum: string;
  createdBy: string;
  createdAt: string;
  changelog?: string;
  isApprovalVersion?: boolean;
  metadata?: MetadataProfile;
}

export const AssetVersionSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  versionNumber: z.number(),
  url: z.string(),
  size: z.number(),
  checksum: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  changelog: z.string().optional(),
  isApprovalVersion: z.boolean().optional(),
  metadata: MetadataProfileSchema.optional(),
});

// Approval Request and Workflows
export interface ApprovalRequest {
  id: string;
  assetId: string;
  versionId: string;
  requestedBy: string;
  approvers: string[];
  currentStatus: 'draft' | 'review' | 'approved' | 'rejected' | 'published' | 'archived';
  comments?: string[];
  updatedAt: string;
}

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  versionId: z.string(),
  requestedBy: z.string(),
  approvers: z.array(z.string()),
  currentStatus: z.enum(['draft', 'review', 'approved', 'rejected', 'published', 'archived']),
  comments: z.array(z.string()).optional(),
  updatedAt: z.string(),
});

export interface ApprovalWorkflow {
  id: string;
  name: string;
  steps: Array<{
    name: string;
    role: string;
    requiredApprovals: number;
  }>;
}

export const ApprovalWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  steps: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      requiredApprovals: z.number(),
    })
  ),
});

// Archiving & Retentions
export interface ArchivePolicy {
  id: string;
  name: string;
  transitionDaysToNearline?: number;
  transitionDaysToCold?: number;
  storageProvider: string;
}

export const ArchivePolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  transitionDaysToNearline: z.number().optional(),
  transitionDaysToCold: z.number().optional(),
  storageProvider: z.string(),
});

export interface RetentionPolicy {
  id: string;
  name: string;
  retentionDays: number;
  actionAfterExpiration: 'delete' | 'archive' | 'review';
}

export const RetentionPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  retentionDays: z.number(),
  actionAfterExpiration: z.enum(['delete', 'archive', 'review']),
});

// Media Asset
export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folderId?: string;
  checksum: string;
  technicalMetadata: TechnicalMetadata;
  metadata: MetadataProfile;
  rights?: MediaRights;
  currentVersionNumber: number;
  versions: AssetVersion[];
  lifecycleState: 'online' | 'nearline' | 'cold' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export const MediaAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  folderId: z.string().optional(),
  checksum: z.string(),
  technicalMetadata: TechnicalMetadataSchema,
  metadata: MetadataProfileSchema,
  rights: MediaRightsSchema.optional(),
  currentVersionNumber: z.number(),
  versions: z.array(AssetVersionSchema),
  lifecycleState: z.enum(['online', 'nearline', 'cold', 'deleted']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Collections and Folders
export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
  inheritedMetadata?: MetadataProfile;
  createdAt: string;
}

export const AssetFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().optional(),
  inheritedMetadata: MetadataProfileSchema.optional(),
  createdAt: z.string(),
});

export interface AssetCollection {
  id: string;
  name: string;
  assetIds: string[];
  type: 'standard' | 'smart' | 'dynamic' | 'saved_search' | 'favorites' | 'recently_used';
  smartCriteria?: {
    tags?: string[];
    fileTypes?: string[];
    minScore?: number;
    searchQuery?: string;
  };
  createdAt: string;
}

export const AssetCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  assetIds: z.array(z.string()),
  type: z.enum(['standard', 'smart', 'dynamic', 'saved_search', 'favorites', 'recently_used']),
  smartCriteria: z
    .object({
      tags: z.array(z.string()).optional(),
      fileTypes: z.array(z.string()).optional(),
      minScore: z.number().optional(),
      searchQuery: z.string().optional(),
    })
    .optional(),
  createdAt: z.string(),
});

// Asset Analytics
export interface AssetAnalytics {
  assetId: string;
  downloadsCount: number;
  projectUsageCount: number;
  renderFrequency: number;
  publishingHistory: Array<{
    platform: string;
    publishedAt: string;
    url?: string;
  }>;
  aiUsageLogs: Array<{
    tool: string;
    timestamp: string;
  }>;
  storageGrowthBytes: number;
}

export const AssetAnalyticsSchema = z.object({
  assetId: z.string(),
  downloadsCount: z.number(),
  projectUsageCount: z.number(),
  renderFrequency: z.number(),
  publishingHistory: z.array(
    z.object({
      platform: z.string(),
      publishedAt: z.string(),
      url: z.string().optional(),
    })
  ),
  aiUsageLogs: z.array(
    z.object({
      tool: z.string(),
      timestamp: z.string(),
    })
  ),
  storageGrowthBytes: z.number(),
});

// Adapters for Plugin Support
export interface MetadataExtractorPlugin {
  id: string;
  name: string;
  supportedMimeTypes: string[];
  extract(fileUrl: string): Promise<Record<string, any>>;
}

export interface ImportProviderPlugin {
  id: string;
  name: string;
  supportedSchemes: string[]; // e.g. ['s3', 'sftp']
  importAsset(sourceUrl: string): Promise<{ localPath: string; checksum: string; size: number }>;
}

export interface RightsProviderPlugin {
  id: string;
  name: string;
  validateRights(asset: MediaAsset, territory?: string): Promise<{ cleared: boolean; reason?: string }>;
}

export interface ArchiveProviderPlugin {
  id: string;
  name: string;
  moveToArchive(assetId: string, archiveState: 'nearline' | 'cold'): Promise<{ archiveUrl: string; status: 'online' | 'nearline' | 'cold' }>;
  restoreFromArchive(assetId: string): Promise<{ localUrl: string; status: 'online' }>;
}
