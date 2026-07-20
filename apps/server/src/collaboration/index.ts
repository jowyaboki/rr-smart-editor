import { CollaborativeSession, Participant, Operation } from '../../../packages/collaboration/src/types';

export class ServerCollaborationManager {
  private activeRooms = new Map<string, CollaborativeSession>();

  public createRoom(sessionId: string, projectId: string, host: Participant): CollaborativeSession {
    const room: CollaborativeSession = {
      id: sessionId,
      projectId,
      participants: [host],
      presences: {},
    };
    this.activeRooms.set(sessionId, room);
    return room;
  }

  public joinRoom(sessionId: string, participant: Participant): CollaborativeSession {
    const room = this.activeRooms.get(sessionId);
    if (!room) {
      throw new Error(`Room with ID "${sessionId}" does not exist.`);
    }
    if (!room.participants.some(p => p.id === participant.id)) {
      room.participants.push(participant);
    }
    return room;
  }

  public leaveRoom(sessionId: string, participantId: string): void {
    const room = this.activeRooms.get(sessionId);
    if (room) {
      room.participants = room.participants.filter(p => p.id !== participantId);
      delete room.presences[participantId];
      if (room.participants.length === 0) {
        this.activeRooms.delete(sessionId);
      }
    }
  }

  public getRoom(sessionId: string): CollaborativeSession | undefined {
    return this.activeRooms.get(sessionId);
  }
}
export const serverCollaboration = new ServerCollaborationManager();
