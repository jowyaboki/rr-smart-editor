import { z } from 'zod';

export type AssetApprovalStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'archived';

export const AssetApprovalStatusSchema = z.enum(['draft', 'in_review', 'approved', 'rejected', 'archived']);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface AssetMetadata {
  title: string;
  description: string;
  keywords: string[];
  categories: string[];
  author: string;
  source?: string;
  copyright?: string;
  language?: string;
  location?: string;
  colorPalette?: string[];
  dominantColors?: string[];
  aiGeneratedTags?: string[];
  customMetadata?: Record<string, string>;
  resolution?: { width: number; height: number };
  duration?: number; // in seconds
  codec?: string;
  fileType: string;
}

export const AssetMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  author: z.string(),
  source: z.string().optional(),
  copyright: z.string().optional(),
  language: z.string().optional(),
  location: z.string().optional(),
  colorPalette: z.array(z.string()).optional(),
  dominantColors: z.array(z.string()).optional(),
  aiGeneratedTags: z.array(z.string()).optional(),
  customMetadata: z.record(z.string()).optional(),
  resolution: z.object({ width: z.number(), height: z.number() }).optional(),
  duration: z.number().optional(),
  codec: z.string().optional(),
  fileType: z.string(),
});

export interface AssetLicense {
  licenseType: string;
  expirationDate?: number;
  usageRestrictions?: string[];
  territory?: string;
  attributionRequired: boolean;
  commercialUse: boolean;
}

export const AssetLicenseSchema = z.object({
  licenseType: z.string(),
  expirationDate: z.number().optional(),
  usageRestrictions: z.array(z.string()).optional(),
  territory: z.string().optional(),
  attributionRequired: z.boolean(),
  commercialUse: z.boolean(),
});

export interface AssetApproval {
  status: AssetApprovalStatus;
  reviewerComments?: string[];
  history: { status: AssetApprovalStatus; reviewer: string; timestamp: number; comment?: string }[];
}

export const AssetApprovalSchema = z.object({
  status: AssetApprovalStatusSchema,
  reviewerComments: z.array(z.string()).optional(),
  history: z.array(z.object({
    status: AssetApprovalStatusSchema,
    reviewer: z.string(),
    timestamp: z.number(),
    comment: z.string().optional(),
  })),
});

export interface AssetUsage {
  projectsUsedIn: string[]; // project IDs
  scenesCount: number;
  timelineClipsCount: number;
  templatesUsedIn: string[];
  publishedVideos: string[];
}

export const AssetUsageSchema = z.object({
  projectsUsedIn: z.array(z.string()).default([]),
  scenesCount: z.number().default(0),
  timelineClipsCount: z.number().default(0),
  templatesUsedIn: z.array(z.string()).default([]),
  publishedVideos: z.array(z.string()).default([]),
});

export interface AssetVersion {
  version: string;
  checksum: string;
  size: number;
  url: string;
  uploadedAt: number;
  changelog?: string;
}

export const AssetVersionSchema = z.object({
  version: z.string(),
  checksum: z.string(),
  size: z.number(),
  url: z.string(),
  uploadedAt: z.number(),
  changelog: z.string().optional(),
});

export interface Asset {
  id: string;
  name: string;
  checksum: string;
  url: string;
  metadata: AssetMetadata;
  license: AssetLicense;
  approval: AssetApproval;
  usage: AssetUsage;
  versions: AssetVersion[];
  folderId?: string;
  collections: string[]; // Collection IDs
}

// ==========================================
// ORGANIZATIONAL STRUCTURES
// ==========================================

export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface AssetCollection {
  id: string;
  name: string;
  isSmart: boolean;
  savedSearchFilter?: string; // Query filter string
  favoriteAssetIds: string[];
}

export interface AssetRelationship {
  sourceAssetId: string;
  targetAssetId: string;
  relationshipType: 'proxy' | 'derived' | 'source_clip';
}
