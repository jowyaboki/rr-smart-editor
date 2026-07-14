import { useEffect } from 'react';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { ShortcutService } from '../services/ShortcutService';

export const useKeyboardShortcuts = () => {
  const {
    playheadFrame,
    setPlayhead,
    selectedClipIds,
    deleteClip
  } = useTimelineStore();

  const { undo, redo } = useTimelineStore.temporal.getState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (ShortcutService.isDelete(e)) {
        selectedClipIds.forEach(id => deleteClip(id));
      } else if (ShortcutService.isUndo(e)) {
        e.preventDefault();
        undo();
      } else if (ShortcutService.isRedo(e)) {
        e.preventDefault();
        redo();
      } else if (e.key === 'ArrowRight') {
        setPlayhead(playheadFrame + 1);
      } else if (e.key === 'ArrowLeft') {
        setPlayhead(playheadFrame - 1);
      } else if (e.key === 'Home') {
        setPlayhead(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playheadFrame, selectedClipIds, undo, redo, deleteClip, setPlayhead]);
};
