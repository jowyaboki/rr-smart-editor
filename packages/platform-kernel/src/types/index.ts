import { z } from 'zod';

// Lifecycle States
export type LifecycleState =
  | 'Created'
  | 'Registered'
  | 'Initialized'
  | 'Running'
  | 'Suspended'
  | 'Failed'
  | 'Recovering'
  | 'Disposed';

export const LifecycleStateSchema = z.enum([
  'Created',
  'Registered',
  'Initialized',
  'Running',
  'Suspended',
  'Failed',
  'Recovering',
  'Disposed',
]);

// Module Manifest & Descriptors
export type StartupPhase = "CORE" | "USER_VISIBLE" | "BACKGROUND" | "OPTIONAL" | "ON_DEMAND";

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  dependencies: string[]; // List of other module IDs
  capabilities: string[]; // List of provided capabilities
  priority?: StartupPhase;
}

export const ModuleManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  dependencies: z.array(z.string()),
  capabilities: z.array(z.string()),
});

export interface ServiceDescriptor {
  id: string;
  interfaceName: string;
  implementationClass: string;
  isSingleton: boolean;
  scope: 'global' | 'workspace' | 'transient';
}

export const ServiceDescriptorSchema = z.object({
  id: z.string(),
  interfaceName: z.string(),
  implementationClass: z.string(),
  isSingleton: z.boolean(),
  scope: z.enum(['global', 'workspace', 'transient']),
});

// Configuration
export interface PlatformConfiguration {
  global: Record<string, any>;
  workspace: Record<string, any>;
  moduleOverrides: Record<string, any>; // Record of overrides by module ID
}

export const PlatformConfigurationSchema = z.object({
  global: z.record(z.string(), z.any()),
  workspace: z.record(z.string(), z.any()),
  moduleOverrides: z.record(z.string(), z.any()),
});

// Context
export interface PlatformContext {
  kernelId: string;
  env: string;
  configuration: PlatformConfiguration;
  startTime: string;
}

export const PlatformContextSchema = z.object({
  kernelId: z.string(),
  env: z.string(),
  configuration: PlatformConfigurationSchema,
  startTime: z.string(),
});

// Dependency Graph
export interface DependencyNode {
  id: string;
  dependencies: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  hasCycles: boolean;
  evaluationOrder: string[];
}

export const DependencyNodeSchema = z.object({
  id: z.string(),
  dependencies: z.array(z.string()),
});

export const DependencyGraphSchema = z.object({
  nodes: z.array(DependencyNodeSchema),
  hasCycles: z.boolean(),
  evaluationOrder: z.array(z.string()),
});

// Health Status
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  errorsCount: number;
  warningsCount: number;
  memoryUsageBytes: number;
  moduleStatuses: Record<string, LifecycleState>; // Record of states by module ID
  heartbeatTime: string;
}

export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  errorsCount: z.number(),
  warningsCount: z.number(),
  memoryUsageBytes: z.number(),
  moduleStatuses: z.record(z.string(), LifecycleStateSchema),
  heartbeatTime: z.string(),
});

// Base interfaces for Modules & Services
export interface PlatformService {
  descriptor: ServiceDescriptor;
  initialize(context: PlatformContext): Promise<void>;
}

export interface PlatformModule {
  manifest: ModuleManifest;
  state: LifecycleState;
  services: PlatformService[];
  initialize(context: PlatformContext): Promise<void>;
  start(context: PlatformContext): Promise<void>;
  stop(context: PlatformContext): Promise<void>;
}

// Capabilities
export interface Capability {
  id: string;
  providerModuleId: string;
  description: string;
}

export const CapabilitySchema = z.object({
  id: z.string(),
  providerModuleId: z.string(),
  description: z.string(),
});
