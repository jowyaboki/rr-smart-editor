import { create } from 'zustand';
import { ReviewThread, Annotation, Comment, ReviewStatus } from '@ai-video-editor/shared';
import { CommentService } from '../services/CommentService';
import { ReviewService } from '../services/ReviewService';
import { AnnotationService } from '../services/AnnotationService';

export interface CollaborationFilters {
  searchQuery: string;
  authorId?: string;
  status?: 'resolved' | 'unresolved' | 'all';
  targetType?: ReviewThread['targetType'];
}

export interface CollaborationStoreState {
  threads: ReviewThread[];
  annotations: Annotation[];
  selectedThreadId: string | null;
  filters: CollaborationFilters;
  reviewStatus: ReviewStatus;

  // Thread operations
  addThread: (params: {
    projectId: string;
    targetType: ReviewThread['targetType'];
    targetId: string;
    title: string;
    authorId: string;
    authorName: string;
    content: string;
  }) => ReviewThread;
  addReply: (
    threadId: string,
    authorId: string,
    authorName: string,
    content: string,
  ) => Comment | null;
  resolveThread: (threadId: string, resolverName: string) => void;
  reopenThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;

  // Annotation operations
  addAnnotation: (params: {
    projectId: string;
    type: Annotation['type'];
    timeStart: number;
    timeEnd?: number;
    label: string;
    color?: string;
    priority?: Annotation['priority'];
    authorId: string;
  }) => Annotation;
  deleteAnnotation: (annotationId: string) => void;

  // Selection & UI
  setSelectedThreadId: (id: string | null) => void;
  setFilters: (filters: Partial<CollaborationFilters>) => void;
  setReviewStatus: (status: ReviewStatus) => void;

  // Export / Import
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

export const useCollaborationStore = create<CollaborationStoreState>((set, get) => ({
  threads: [],
  annotations: [],
  selectedThreadId: null,
  filters: {
    searchQuery: '',
    status: 'all',
  },
  reviewStatus: 'draft',

  addThread: (params) => {
    const thread = CommentService.createThread(params);
    set((state) => ({
      threads: [thread, ...state.threads],
    }));
    return thread;
  },

  addReply: (threadId, authorId, authorName, content) => {
    let reply: Comment | null = null;
    set((state) => {
      const updatedThreads = state.threads.map((t) => {
        if (t.id === threadId) {
          reply = CommentService.addReply({
            thread: t,
            authorId,
            authorName,
            content,
          });
          return { ...t }; // trigger update
        }
        return t;
      });
      return { threads: updatedThreads };
    });
    return reply;
  },

  resolveThread: (threadId, resolverName) => {
    set((state) => {
      const updatedThreads = state.threads.map((t) => {
        if (t.id === threadId) {
          ReviewService.resolveThread(t, resolverName);
          return { ...t };
        }
        return t;
      });
      return { threads: updatedThreads };
    });
  },

  reopenThread: (threadId) => {
    set((state) => {
      const updatedThreads = state.threads.map((t) => {
        if (t.id === threadId) {
          ReviewService.reopenThread(t);
          return { ...t };
        }
        return t;
      });
      return { threads: updatedThreads };
    });
  },

  deleteThread: (threadId) => {
    set((state) => ({
      threads: state.threads.filter((t) => t.id !== threadId),
      selectedThreadId: state.selectedThreadId === threadId ? null : state.selectedThreadId,
    }));
  },

  addAnnotation: (params) => {
    const annot = AnnotationService.createAnnotation(params);
    set((state) => ({
      annotations: [annot, ...state.annotations],
    }));
    return annot;
  },

  deleteAnnotation: (annotationId) => {
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== annotationId),
    }));
  },

  setSelectedThreadId: (id) => set({ selectedThreadId: id }),
  setFilters: (updates) => set((state) => ({ filters: { ...state.filters, ...updates } })),
  setReviewStatus: (status) => set({ reviewStatus: status }),

  exportData: () => {
    const data = {
      threads: get().threads,
      annotations: get().annotations,
      reviewStatus: get().reviewStatus,
    };
    return JSON.stringify(data);
  },

  importData: (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && (Array.isArray(parsed.threads) || Array.isArray(parsed.annotations))) {
        set({
          threads: parsed.threads || [],
          annotations: parsed.annotations || [],
          reviewStatus: parsed.reviewStatus || 'draft',
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
