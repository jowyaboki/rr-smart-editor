import { create } from 'zustand';

export interface WorkflowContext {
  type:
    | 'Project'
    | 'Sequence'
    | 'Timeline'
    | 'Track'
    | 'Video Clip'
    | 'Audio Clip'
    | 'Image'
    | 'Subtitle'
    | 'Transition'
    | 'Effect'
    | 'Animation'
    | 'Camera'
    | 'Light'
    | 'Environment'
    | 'AI Suggestion'
    | 'Asset Folder'
    | 'Render Job'
    | 'Export Preset'
    | 'Cloud Asset'
    | 'Comment'
    | 'Review Thread';
  id: string;
  name: string;
  meta?: Record<string, any>;
}

interface WorkflowState {
  // Current dynamic workspace layout mode
  workspaceMode: string;
  setWorkspaceMode: (mode: string) => void;

  // Global Context selection
  selectedContext: WorkflowContext | null;
  setSelectedContext: (context: WorkflowContext | null) => void;

  // Discovery / Recommendation suggestions list
  recommendedActions: Array<{
    id: string;
    label: string;
    category: string;
    description: string;
    action: () => void;
  }>;
  recentCommands: string[];
  addRecentCommand: (cmd: string) => void;

  // Background statuses
  statusPanelExpanded: boolean;
  setStatusPanelExpanded: (expanded: boolean) => void;
  backgroundJobs: Array<{
    id: string;
    name: string;
    status: 'running' | 'success' | 'failed';
    progress: number;
    type: string;
  }>;
  addJob: (job: { id: string; name: string; type: string }) => void;
  updateJobProgress: (
    id: string,
    progress: number,
    status?: 'running' | 'success' | 'failed',
  ) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workspaceMode: 'editing',
  setWorkspaceMode: (mode) => {
    set({ workspaceMode: mode });
    localStorage.setItem('rr_editor_layout_preset', mode);
    window.dispatchEvent(new Event('storage'));
  },

  selectedContext: { type: 'Project', id: 'project-root', name: 'Premium Brand Campaign V2' },
  setSelectedContext: (selectedContext) => set({ selectedContext }),

  recommendedActions: [],
  recentCommands: [
    'Toggle Navigation Sidebar',
    'Focus Productivity Mode',
    'AI Timeline Splitter Agent',
  ],
  addRecentCommand: (cmd) =>
    set((state) => {
      const list = state.recentCommands.filter((c) => c !== cmd);
      return { recentCommands: [cmd, ...list].slice(0, 5) };
    }),

  statusPanelExpanded: false,
  setStatusPanelExpanded: (statusPanelExpanded) => set({ statusPanelExpanded }),

  backgroundJobs: [
    { id: 'job-1', name: 'Render Shard #2', status: 'running', progress: 42, type: 'Rendering' },
    { id: 'job-2', name: 'Cloud Sync upload', status: 'success', progress: 100, type: 'Upload' },
    {
      id: 'job-3',
      name: 'Speech captions extraction',
      status: 'running',
      progress: 78,
      type: 'AI',
    },
  ],
  addJob: (job) =>
    set((state) => ({
      backgroundJobs: [...state.backgroundJobs, { ...job, status: 'running', progress: 0 }],
    })),
  updateJobProgress: (id, progress, status) =>
    set((state) => ({
      backgroundJobs: state.backgroundJobs.map((j) =>
        j.id === id ? { ...j, progress, status: status || j.status } : j,
      ),
    })),
}));
