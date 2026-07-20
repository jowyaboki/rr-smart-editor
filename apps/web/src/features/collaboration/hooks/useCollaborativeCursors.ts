import { useCollaborationStore } from '../store/collaborationStore';
import { webPresence } from '../presence';

export function useCollaborativeCursors(localParticipantId: string) {
  const store = useCollaborationStore();

  const moveCursor = (x: number, y: number) => {
    const updated = webPresence.updatePresence(localParticipantId, { cursor: { x, y } });
    store.updateLocalPresence(localParticipantId, updated);
  };

  const updateSelection = (selection: string[]) => {
    const updated = webPresence.updatePresence(localParticipantId, { currentSelection: selection });
    store.updateLocalPresence(localParticipantId, updated);
  };

  return {
    presences: store.presences,
    moveCursor,
    updateSelection,
  };
}
