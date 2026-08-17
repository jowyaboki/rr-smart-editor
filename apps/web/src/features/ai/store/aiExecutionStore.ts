import { create } from 'zustand';
import {
  ExecutionContextSnapshot,
  ExecutionGraph,
  RuntimeEvent,
  PerformanceMetricsReport,
  AIExecutionRuntime,
  CheckpointSnapshot
} from '@ai-video-editor/ai-copilot';

export interface AIExecutionState {
  runtime: AIExecutionRuntime;
  activeContext: ExecutionContextSnapshot | null;
  activeGraph: ExecutionGraph | null;
  events: RuntimeEvent[];
  checkpoints: CheckpointSnapshot[];
  analytics: PerformanceMetricsReport | null;
  isExecuting: boolean;

  // Actions
  initializeRuntime: (concurrencyLimit?: number) => void;
  startExecution: (graph: ExecutionGraph, initialContext: ExecutionContextSnapshot) => Promise<ExecutionContextSnapshot>;
  pauseExecution: () => void;
  resumeExecution: () => Promise<ExecutionContextSnapshot | void>;
  cancelExecution: (reason?: string) => void;
  restoreCheckpoint: (checkpointId: string) => Promise<ExecutionContextSnapshot | void>;
  resolveApproval: (nodeId: string, approved: boolean, approver?: string, feedback?: string) => Promise<ExecutionContextSnapshot | void>;
  refreshAnalytics: () => void;
}

export const useAIExecutionStore = create<AIExecutionState>((set, get) => {
  const runtime = new AIExecutionRuntime({ concurrencyLimit: 10 });

  runtime.subscribeEvents((evt) => {
    set((state) => ({
      events: [...state.events, evt]
    }));
  });

  return {
    runtime,
    activeContext: null,
    activeGraph: null,
    events: [],
    checkpoints: [],
    analytics: null,
    isExecuting: false,

    initializeRuntime: (concurrencyLimit) => {
      const newRuntime = new AIExecutionRuntime({ concurrencyLimit: concurrencyLimit || 10 });
      newRuntime.subscribeEvents((evt) => {
        set((state) => ({
          events: [...state.events, evt]
        }));
      });
      set({ runtime: newRuntime });
    },

    startExecution: async (graph, initialContext) => {
      const { runtime } = get();
      set({
        activeGraph: graph,
        activeContext: initialContext,
        events: [],
        checkpoints: [],
        isExecuting: true
      });

      try {
        const finalContext = await runtime.runWorkflow(graph, initialContext);
        const analytics = runtime.getExecutionAnalytics(finalContext);
        set({
          activeContext: finalContext,
          analytics,
          isExecuting: false,
          checkpoints: finalContext.checkpoints
        });
        return finalContext;
      } catch (err: any) {
        set((state) => ({
          isExecuting: false,
          activeContext: state.activeContext ? { ...state.activeContext, status: 'failed' } : null
        }));
        throw err;
      }
    },

    pauseExecution: () => {
      const { runtime, activeContext } = get();
      if (activeContext) {
        runtime.pauseWorkflow(activeContext);
        set({ isExecuting: false, activeContext: { ...activeContext, status: 'paused' } });
      }
    },

    resumeExecution: async () => {
      const { runtime, activeContext, activeGraph } = get();
      if (activeContext && activeGraph) {
        set({ isExecuting: true });
        const finalCtx = await runtime.resumeWorkflow(activeContext, activeGraph);
        const analytics = runtime.getExecutionAnalytics(finalCtx);
        set({
          activeContext: finalCtx,
          analytics,
          isExecuting: false,
          checkpoints: finalCtx.checkpoints
        });
        return finalCtx;
      }
    },

    cancelExecution: (reason) => {
      const { runtime, activeContext } = get();
      if (activeContext) {
        runtime.cancelWorkflow(activeContext.executionId, reason);
        set({ isExecuting: false, activeContext: { ...activeContext, status: 'cancelled' } });
      }
    },

    restoreCheckpoint: async (checkpointId) => {
      const { runtime, activeContext, activeGraph } = get();
      if (activeContext && activeGraph) {
        const restoredCtx = await runtime.restoreCheckpoint(activeContext, activeGraph, checkpointId);
        set({ activeContext: restoredCtx });
        return restoredCtx;
      }
    },

    resolveApproval: async (nodeId, approved, approver, feedback) => {
      const { runtime, activeContext, activeGraph } = get();
      if (activeContext && activeGraph) {
        set({ isExecuting: true });
        const resCtx = await runtime.resolveApprovalGate(activeContext, activeGraph, nodeId, approved, approver, feedback);
        const analytics = runtime.getExecutionAnalytics(resCtx);
        set({
          activeContext: resCtx,
          analytics,
          isExecuting: false,
          checkpoints: resCtx.checkpoints
        });
        return resCtx;
      }
    },

    refreshAnalytics: () => {
      const { runtime, activeContext } = get();
      if (activeContext) {
        const analytics = runtime.getExecutionAnalytics(activeContext);
        set({ analytics });
      }
    }
  };
});
