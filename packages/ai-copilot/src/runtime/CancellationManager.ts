export class CancellationManager {
  private controllers = new Map<string, AbortController>();

  createToken(executionId: string): AbortSignal {
    const controller = new AbortController();
    this.controllers.set(executionId, controller);
    return controller.signal;
  }

  cancel(executionId: string, reason?: string): void {
    const controller = this.controllers.get(executionId);
    if (controller) {
      controller.abort(reason || 'Execution cancelled by user or system');
      this.controllers.delete(executionId);
    }
  }

  isCancelled(executionId: string): boolean {
    const controller = this.controllers.get(executionId);
    return controller ? controller.signal.aborted : false;
  }

  cleanup(executionId: string): void {
    this.controllers.delete(executionId);
  }
}
