import { z } from 'zod';

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'waiting_for_approval'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'recovering';

export type NodeExecutionStatus =
  | 'pending'
  | 'running'
  | 'waiting_for_approval'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cancelled';

export interface ArtifactReference {
  id: string;
  name: string;
  type: 'script' | 'storyboard' | 'video_clip' | 'audio_track' | 'color_grade' | 'metadata' | 'render_spec' | 'generic';
  uri: string;
  sizeBytes?: number;
  hash?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  exponential: boolean;
  retryableErrors?: string[];
}

export interface QualityGateRule {
  id: string;
  name: string;
  type: 'automatic' | 'human_approval' | 'scoring' | 'brand_compliance' | 'asset_completeness' | 'render_readiness';
  minScore?: number;
  requiredFields?: string[];
  handler?: (context: ExecutionContextSnapshot) => Promise<{ passed: boolean; score?: number; reason?: string }>;
}

export interface ApprovalGate {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  decisionAt?: string;
  feedback?: string;
}

export interface ExecutionNode {
  id: string;
  name: string;
  agentRole: 'creative_director' | 'script_writer' | 'storyboard_planner' | 'asset_resolver' | 'timeline_builder' | 'color_ist' | 'audio_engineer' | 'quality_auditor' | 'custom';
  status: NodeExecutionStatus;
  dependencies: string[]; // Parent node IDs
  conditionalBranch?: {
    condition: (context: ExecutionContextSnapshot) => boolean;
    ifTrue: string[]; // target node IDs
    ifFalse: string[];
  };
  fallbackNodeId?: string;
  retryPolicy?: RetryPolicy;
  qualityGates?: QualityGateRule[];
  approvalGate?: ApprovalGate;
  timeoutMs?: number;
  isOptional?: boolean;
  handler?: (ctx: ExecutionContextSnapshot, signal: AbortSignal) => Promise<Record<string, any>>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  attempts?: number;
  outputArtifacts?: ArtifactReference[];
}

export interface ExecutionGraph {
  graphId: string;
  name: string;
  version: string;
  nodes: Record<string, ExecutionNode>;
}

export interface CheckpointSnapshot {
  checkpointId: string;
  executionId: string;
  timestamp: string;
  stageName: string;
  graphState: Record<string, { status: NodeExecutionStatus; attempts: number; error?: string }>;
  contextData: Record<string, any>;
  artifacts: ArtifactReference[];
  approvals: ApprovalGate[];
}

export interface ExecutionContextSnapshot {
  executionId: string;
  workflowId: string;
  projectId: string;
  organizationId?: string;
  status: ExecutionStatus;
  currentStage: string;
  variables: Record<string, any>;
  artifacts: ArtifactReference[];
  checkpoints: CheckpointSnapshot[];
  approvals: ApprovalGate[];
  errors: { timestamp: string; nodeId?: string; message: string; stack?: string }[];
  metrics: {
    startTime: number;
    endTime?: number;
    totalDurationMs?: number;
    schedulerLatencyMs?: number;
    nodeDurationsMs: Record<string, number>;
    retryCounts: Record<string, number>;
    resourceUsage: { cpuUsagePercent: number; memoryMb: number };
  };
}

export interface RuntimeEvent {
  id: string;
  timestamp: string;
  executionId: string;
  type:
    | 'execution.started'
    | 'execution.paused'
    | 'execution.resumed'
    | 'execution.completed'
    | 'execution.failed'
    | 'execution.cancelled'
    | 'node.started'
    | 'node.completed'
    | 'node.failed'
    | 'checkpoint.created'
    | 'checkpoint.restored'
    | 'approval.requested'
    | 'approval.granted'
    | 'approval.rejected'
    | 'retry.started'
    | 'recovery.started';
  nodeId?: string;
  details?: Record<string, any>;
}

export interface EnterpriseQuota {
  organizationId: string;
  maxConcurrentExecutions: number;
  maxAgentPoolSize: number;
  priorityLevel: number;
  costBudgetUsd: number;
  currentCostUsd: number;
}
