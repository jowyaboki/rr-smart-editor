import { create } from 'zustand';
import { RenderJob, RenderStatus, RenderSettings } from '../types';
import { RenderEngine } from '../engine/RenderEngine';

interface RenderingStore {
  jobs: RenderJob[];
  currentJobId: string | null;
  engine: RenderEngine;

  createJob: (projectId: string, projectName: string, settings: RenderSettings) => void;
  cancelJob: (jobId: string) => void;
  updateJobProgress: (jobId: string, progress: any) => void;
  removeJob: (jobId: string) => void;
}

export const useRenderingStore = create<RenderingStore>((set, get) => ({
  jobs: [],
  currentJobId: null,
  engine: new RenderEngine(),

  createJob: (projectId, projectName, settings) => {
    const newJob: RenderJob = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      projectName,
      status: 'pending',
      settings,
      progress: { frame: 0, totalFrames: 0, percentage: 0, fps: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ jobs: [...state.jobs, newJob] }));
    get().engine.startRender(newJob);
  },

  cancelJob: (jobId) => {
    get().engine.cancelRender(jobId);
    set((state) => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, status: 'cancelled' as RenderStatus } : j)
    }));
  },

  updateJobProgress: (jobId, progress) => set((state) => ({
    jobs: state.jobs.map(j => j.id === jobId ? { ...j, progress, updatedAt: new Date().toISOString() } : j)
  })),

  removeJob: (jobId) => set((state) => ({
    jobs: state.jobs.filter(j => j.id !== jobId)
  })),
}));
