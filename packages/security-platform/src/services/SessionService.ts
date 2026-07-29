import { Session } from '../types';

export class SessionService {
  private activeSessions: Map<string, Session> = new Map();

  public createSession(
    identityId: string,
    userAgent: string,
    ipAddress: string,
    timeoutMinutes: number = 60
  ): Session {
    const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;

    const newSess: Session = {
      id: sessionId,
      identityId,
      deviceInfo: {
        deviceId: `dev_${Math.random().toString(36).substr(2, 9)}`,
        userAgent,
        ipAddress,
        isTrusted: true,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'active',
    };

    this.activeSessions.set(sessionId, newSess);
    return newSess;
  }

  public revokeSession(sessionId: string): void {
    const sess = this.activeSessions.get(sessionId);
    if (sess) {
      sess.status = 'revoked';
    }
  }

  public getSession(sessionId: string): Session | undefined {
    return this.activeSessions.get(sessionId);
  }

  public listSessions(identityId?: string): Session[] {
    const list = Array.from(this.activeSessions.values());
    if (identityId) {
      return list.filter((s) => s.identityId === identityId);
    }
    return list;
  }
}

export const globalSessionService = new SessionService();
export default globalSessionService;
