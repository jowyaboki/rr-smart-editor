import { z } from 'zod';

export type PackageType =
  | 'plugin'
  | 'template'
  | 'transition'
  | 'effect'
  | 'component'
  | 'node_pack'
  | 'workflow_pack'
  | 'ai_agent'
  | 'expression_library'
  | 'theme_pack'
  | 'icon_pack'
  | 'language_pack'
  | 'data_connector'
  | 'publishing_adapter';

export const PackageTypeSchema = z.enum([
  'plugin',
  'template',
  'transition',
  'effect',
  'component',
  'node_pack',
  'workflow_pack',
  'ai_agent',
  'expression_library',
  'theme_pack',
  'icon_pack',
  'language_pack',
  'data_connector',
  'publishing_adapter',
]);

export type PermissionType =
  | 'filesystem'
  | 'network'
  | 'ai'
  | 'rendering'
  | 'publishing'
  | 'project_access'
  | 'workspace_access';

export const PermissionTypeSchema = z.enum([
  'filesystem',
  'network',
  'ai',
  'rendering',
  'publishing',
  'project_access',
  'workspace_access',
]);

// ==========================================
// PACKAGE MANIFEST
// ==========================================

export interface ExtensionManifest {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  homepage?: string;
  license?: string;
  category: PackageType;
  tags: string[];
  icon?: string;
  screenshots?: string[];
  editorVersion: string;
  engineVersion: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  permissions: PermissionType[];
  activationEvents: string[];
  entry: string;
  signature?: string;
}

export const ExtensionManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  homepage: z.string().optional(),
  license: z.string().optional(),
  category: PackageTypeSchema,
  tags: z.array(z.string()).default([]),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  editorVersion: z.string(),
  engineVersion: z.string(),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  permissions: z.array(PermissionTypeSchema).default([]),
  activationEvents: z.array(z.string()).default([]),
  entry: z.string(),
  signature: z.string().optional(),
});

// ==========================================
// EXTENSION SYSTEM CONTRIBUTIONS
// ==========================================

export interface ContributionRegistry {
  commands?: { id: string; title: string; handler: () => void }[];
  panels?: { id: string; title: string; component: any }[];
  editors?: { id: string; fileExtension: string; component: any }[];
  timelineTools?: { id: string; icon: string; cursor: string }[];
  effects?: { id: string; name: string; parameters: any }[];
  transitions?: { id: string; name: string; duration: number }[];
  aiTools?: { id: string; name: string; systemPrompt: string }[];
  workflowNodes?: { id: string; label: string; executor: any }[];
  nodeGraphNodes?: { id: string; label: string; inputs: any[]; outputs: any[] }[];
  dataConnectors?: { id: string; source: string; fetchFn: any }[];
  publishTargets?: { id: string; name: string; publishFn: any }[];
}

export interface Extension {
  manifest: ExtensionManifest;
  contributions: ContributionRegistry;
  enabled: boolean;
  state: 'installed' | 'enabled' | 'disabled' | 'broken';
}
