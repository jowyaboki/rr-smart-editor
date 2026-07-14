import { useCallback, useMemo } from 'react';
import { useCollaborationStore } from '../store/collaborationStore';
import { ReviewThread } from '@ai-video-editor/shared';

export const useCollaboration = (projectId: string) => {
  const store = useCollaborationStore();

  // Filter threads based on project, selection, and filters query
  const filteredThreads = useMemo(() => {
    return store.threads.filter((t) => {
      // Must match active project ID
      if (t.projectId !== projectId) return false;

      // Status filters
      if (store.filters.status === 'resolved' && !t.resolved) return false;
      if (store.filters.status === 'unresolved' && t.resolved) return false;

      // Target Type filters
      if (store.filters.targetType && t.targetType !== store.filters.targetType) return false;

      // Text search query
      if (store.filters.searchQuery) {
        const query = store.filters.searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesComments = t.comments.some((c) => c.content.toLowerCase().includes(query));
        return matchesTitle || matchesComments;
      }

      return true;
    });
  }, [store.threads, store.filters, projectId]);

  // Project annotations
  const projectAnnotations = useMemo(() => {
    return store.annotations.filter((a) => a.projectId === projectId);
  }, [store.annotations, projectId]);

  return {
    threads: filteredThreads,
    annotations: projectAnnotations,
    selectedThreadId: store.selectedThreadId,
    reviewStatus: store.reviewStatus,
    filters: store.filters,

    // Thread Actions
    addThread: useCallback(
      (params: {
        targetType: ReviewThread['targetType'];
        targetId: string;
        title: string;
        authorId: string;
        authorName: string;
        content: string;
      }) => {
        return store.addThread({ ...params, projectId });
      },
      [store.addThread, projectId],
    ),

    addReply: store.addReply,
    resolveThread: store.resolveThread,
    reopenThread: store.reopenThread,
    deleteThread: store.deleteThread,

    // Annotation Actions
    addAnnotation: useCallback(
      (params: {
        type: 'marker' | 'frame' | 'region' | 'text';
        timeStart: number;
        timeEnd?: number;
        label: string;
        color?: string;
        priority?: 'low' | 'medium' | 'high';
        authorId: string;
      }) => {
        return store.addAnnotation({ ...params, projectId });
      },
      [store.addAnnotation, projectId],
    ),

    deleteAnnotation: store.deleteAnnotation,

    // UI & Config
    setSelectedThreadId: store.setSelectedThreadId,
    setFilters: store.setFilters,
    setReviewStatus: store.setReviewStatus,
    exportData: store.exportData,
    importData: store.importData,
  };
};
