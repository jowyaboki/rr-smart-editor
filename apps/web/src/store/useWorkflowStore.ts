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

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'away' | 'offline';
  workspace: string;
  tool: string;
  selectionId?: string;
  playhead: number; // In frames
  color: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

interface WorkflowState {
  workspaceMode: string;
  setWorkspaceMode: (mode: string) => void;

  selectedContext: WorkflowContext | null;
  setSelectedContext: (context: WorkflowContext | null) => void;

  recommendedActions: Array<{ id: string; label: string; category: string; description: string; action: () => void }>;
  recentCommands: string[];
  addRecentCommand: (cmd: string) => void;

  statusPanelExpanded: boolean;
  setStatusPanelExpanded: (expanded: boolean) => void;
  backgroundJobs: Array<{ id: string; name: string; status: 'running' | 'success' | 'failed'; progress: number; type: string }>;
  addJob: (job: { id: string; name: string; type: string }) => void;
  updateJobProgress: (id: string, progress: number, status?: 'running' | 'success' | 'failed') => void;

  // Workspace Locks & Custom Options
  workspaceLocked: boolean;
  toggleWorkspaceLock: () => void;

  // Keyframe details / Easing Mode
  activeEasing: 'linear' | 'ease-in' | 'ease-out' | 'bezier';
  setActiveEasing: (easing: 'linear' | 'ease-in' | 'ease-out' | 'bezier') => void;

  // Selected Transition
  activeTransition: string;
  setActiveTransition: (transition: string) => void;

  // Phase 1 Real-time Collaborators
  collaborators: Collaborator[];
  setCollaborators: (collaborators: Collaborator[]) => void;
  updateCollaboratorPlayhead: (id: string, playhead: number) => void;
  updateCollaboratorSelection: (id: string, selectionId: string) => void;

  // Viewport Active Editor Name (editing ownership)
  viewportOwner: string | null;
  setViewportOwner: (owner: string | null) => void;

  // Creative Knowledge Articles
  articles: KnowledgeArticle[];
  searchArticles: (query: string) => KnowledgeArticle[];

  // Adaptive Inspector predictive history count
  recentPropertiesEdited: string[];
  recordPropertyEdit: (propName: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workspaceMode: 'editing',
  setWorkspaceMode: (mode) => {
    set({ workspaceMode: mode });
    localStorage.setItem('rr_editor_layout_preset', mode);
    window.dispatchEvent(new Event('storage'));
  },

  selectedContext: { type: 'Project', id: 'project-root', name: 'Premium Brand Campaign V2' },
  setSelectedContext: (selectedContext) => set({ selectedContext }),

  recommendedActions: [],
  recentCommands: ['Toggle Navigation Sidebar', 'Focus Productivity Mode', 'AI Timeline Splitter Agent'],
  addRecentCommand: (cmd) => set((state) => {
    const list = state.recentCommands.filter((c) => c !== cmd);
    return { recentCommands: [cmd, ...list].slice(0, 5) };
  }),

  statusPanelExpanded: false,
  setStatusPanelExpanded: (statusPanelExpanded) => set({ statusPanelExpanded }),

  backgroundJobs: [
    { id: 'job-1', name: 'Render Shard #2', status: 'running', progress: 42, type: 'Rendering' },
    { id: 'job-2', name: 'Cloud Sync upload', status: 'success', progress: 100, type: 'Upload' },
    { id: 'job-3', name: 'Speech captions extraction', status: 'running', progress: 78, type: 'AI' },
  ],
  addJob: (job) => set((state) => ({
    backgroundJobs: [...state.backgroundJobs, { ...job, status: 'running', progress: 0 }]
  })),
  updateJobProgress: (id, progress, status) => set((state) => ({
    backgroundJobs: state.backgroundJobs.map((j) =>
      j.id === id ? { ...j, progress, status: status || j.status } : j
    )
  })),

  workspaceLocked: false,
  toggleWorkspaceLock: () => set((state) => ({ workspaceLocked: !state.workspaceLocked })),

  activeEasing: 'bezier',
  setActiveEasing: (activeEasing) => set({ activeEasing }),

  activeTransition: 'crossfade',
  setActiveTransition: (activeTransition) => set({ activeTransition }),

  viewportOwner: 'Sarah (Lead Motion Designer)',

  collaborators: [
    { id: 'user-1', name: 'Sarah (Lead Motion Designer)', avatar: '👩‍🎤', status: 'active', workspace: 'Motion Graphics', tool: 'Easing Preset', selectionId: 'clip-v1', playhead: 120, color: '#ec4899' },
    { id: 'user-2', name: 'James (Colorist)', avatar: '👨‍🎨', status: 'active', workspace: 'Color grading', tool: 'LUT calibration', selectionId: 'clip-v2', playhead: 340, color: '#f59e0b' },
    { id: 'user-3', name: 'Michael (Audio Lead)', avatar: '🎧', status: 'away', workspace: 'Audio Mix', tool: 'Biquad filter', playhead: 15, color: '#10b981' },
    { id: 'user-4', name: 'Copilot AI Copilot', avatar: '🤖', status: 'active', workspace: 'AI Suite', tool: 'Timeline Suggester', playhead: 0, color: '#00f0ff' }
  ],
  setCollaborators: (collaborators) => set({ collaborators }),
  updateCollaboratorPlayhead: (id, playhead) => set((state) => ({
    collaborators: state.collaborators.map((c) => c.id === id ? { ...c, playhead } : c)
  })),
  updateCollaboratorSelection: (id, selectionId) => set((state) => ({
    collaborators: state.collaborators.map((c) => c.id === id ? { ...c, selectionId } : c)
  })),

  articles: [
    { id: 'art-1', title: 'How to map colorist primary wheels', category: 'Colorist Tutorial', content: 'Use Lift, Gamma, and Gain parameters to adjust chromatic highlights and balance exposure levels.' },
    { id: 'art-2', title: 'Smoothing tracks with Bezier Curves', category: 'Motion Guide', content: 'Activate Bezier curves inside the motion graphics editor to calculate dynamic cubic ease transforms.' },
    { id: 'art-3', title: 'Resolving multi-user edit collisions', category: 'Collaboration Best Practice', content: 'Layout locks let you lock track resizes or editing ownership to ensure zero conflicts during live review sessions.' },
    { id: 'art-4', title: 'Custom biquad cutoffs parameters', category: 'Audio Engineering', content: 'Enable high-pass filters with a cutoff at 80Hz to eliminate background rumble.' }
  ],
  searchArticles: (query) => {
    const list = get().articles;
    return list.filter(art =>
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  recentPropertiesEdited: ['Opacity', 'Scale'],
  recordPropertyEdit: (propName) => set((state) => {
    const list = state.recentPropertiesEdited.filter(p => p !== propName);
    return { recentPropertiesEdited: [propName, ...list].slice(0, 3) };
  }),
}));
