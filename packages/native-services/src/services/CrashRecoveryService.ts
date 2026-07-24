import { ICrashRecoveryService } from '@ai-video-editor/desktop-core';
import { Project } from '@ai-video-editor/shared';

export class CrashRecoveryService implements ICrashRecoveryService {
  private recoveredStates: Map<string, Project> = new Map();
  private safeModeEnabled = false;

  public async saveAutoRecoverState(project: Project): Promise<void> {
    this.recoveredStates.set(project.id, JSON.parse(JSON.stringify(project)));
  }

  public async getAutoRecoverState(projectId: string): Promise<Project | null> {
    return this.recoveredStates.get(projectId) || null;
  }

  public async clearAutoRecoverState(projectId: string): Promise<void> {
    this.recoveredStates.delete(projectId);
  }

  public async enterSafeMode(): Promise<void> {
    this.safeModeEnabled = true;
  }

  public isSafeMode(): boolean {
    return this.safeModeEnabled;
  }
}
