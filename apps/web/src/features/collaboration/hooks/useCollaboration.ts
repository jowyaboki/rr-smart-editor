import { useCollaborationStore } from '../store/collaborationStore';
import { webCollaborationService } from '../services';

export function useCollaboration() {
  const store = useCollaborationStore();

  const joinSession = (sessionId: string, projectId: string, participants: any[]) => {
    webCollaborationService.startSession(sessionId, projectId, participants);
    store.joinSession(sessionId, projectId, participants);
  };

  const publishOperation = (op: any) => {
    const res = webCollaborationService.sync.handleOperation(op);
    if (res.status === 'broadcasted') {
      store.appendOperation(op);
    }
  };

  const toggleConnectionState = (online: boolean) => {
    store.setConnected(online);
    const flushedOps = webCollaborationService.sync.setConnectionState(online);
    if (online && flushedOps.length > 0) {
      flushedOps.forEach(op => store.appendOperation(op));
    }
  };

  return {
    sessionId: store.sessionId,
    projectId: store.projectId,
    participants: store.participants,
    operations: store.operations,
    isConnected: store.isConnected,
    joinSession,
    leaveSession: store.leaveSession,
    publishOperation,
    toggleConnectionState,
  };
}
