import { z } from 'zod';

export type WorkspaceRole = 'owner' | 'administrator' | 'manager' | 'editor' | 'reviewer' | 'viewer';

export const WorkspaceRoleSchema = z.enum(['owner', 'administrator', 'manager', 'editor', 'reviewer', 'viewer']);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  createdAt: number;
}

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  createdAt: z.number(),
});

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  createdAt: number;
}

export const WorkspaceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  createdAt: z.number(),
});

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: number;
}

export const WorkspaceMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  role: WorkspaceRoleSchema,
  joinedAt: z.number(),
});

export interface Invitation {
  id: string;
  email: string;
  workspaceId: string;
  role: WorkspaceRole;
  expiresAt: number;
  accepted: boolean;
}

export const InvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  workspaceId: z.string(),
  role: WorkspaceRoleSchema,
  expiresAt: z.number(),
  accepted: z.boolean(),
});

export interface Quota {
  projectsLimit: number;
  assetsLimit: number;
  storageBytesLimit: number;
  renderMinutesLimit: number;
  aiCreditsLimit: number;
  apiRequestsLimit: number;
  pluginsLimit: number;
  templatesLimit: number;
}

export const QuotaSchema = z.object({
  projectsLimit: z.number(),
  assetsLimit: z.number(),
  storageBytesLimit: z.number(),
  renderMinutesLimit: z.number(),
  aiCreditsLimit: z.number(),
  apiRequestsLimit: z.number(),
  pluginsLimit: z.number(),
  templatesLimit: z.number(),
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  quotas: Quota;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  organizationId: string;
  workspaceId: string;
  action: 'login' | 'project_change' | 'publishing' | 'rendering' | 'plugin_installation' | 'permission_change' | 'api_usage';
  message: string;
  ipAddress?: string;
}

export interface TenantSettings {
  id: string;
  organizationId: string;
  theme: string;
  allowedDomains: string[];
}
export interface WorkspaceContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}
