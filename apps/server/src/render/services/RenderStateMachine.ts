import { RenderStatus } from '@ai-video-editor/shared';

export class RenderStateMachine {
  private static VALID_TRANSITIONS: Record<RenderStatus, RenderStatus[]> = {
    queued: ['rendering', 'paused', 'cancelled', 'failed'],
    rendering: ['completed', 'failed', 'cancelled', 'queued'],
    completed: ['queued'],
    failed: ['queued'],
    paused: ['queued', 'cancelled'],
    cancelled: ['queued'],
  };

  public static validateTransition(from: RenderStatus, to: RenderStatus): boolean {
    if (from === to) return true;
    const allowed = this.VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  public static checkAndTransition(from: RenderStatus, to: RenderStatus): void {
    if (!this.validateTransition(from, to)) {
      throw new Error(`Invalid state transition from "${from}" to "${to}"`);
    }
  }
}
