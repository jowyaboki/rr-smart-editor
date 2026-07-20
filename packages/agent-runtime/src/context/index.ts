import { ExecutionContext } from '../types';

export class ContextService {
  private context: ExecutionContext;

  constructor(initialContext?: Partial<ExecutionContext>) {
    this.context = {
      projectId: initialContext?.projectId || 'default-project',
      selection: initialContext?.selection || {
        selectedClipIds: [],
        selectedTrackId: null,
        selectedMarkerId: null,
      },
      timelineState: initialContext?.timelineState || {
        playhead: 0,
        zoom: 1.0,
        duration: 30.0,
        fps: 30,
      },
      variables: initialContext?.variables || {},
      assets: initialContext?.assets || [],
      userPreferences: initialContext?.userPreferences || {
        theme: 'dark',
        autoSave: true,
      },
      openPanels: initialContext?.openPanels || ['timeline', 'media-browser', 'inspector'],
      isCancelled: false,
    };
  }

  /**
   * Retrieves the structured context payload
   */
  public getContext(): ExecutionContext {
    return { ...this.context };
  }

  /**
   * Updates partial parts of the execution context
   */
  public updateContext(updates: Partial<ExecutionContext>): void {
    this.context = {
      ...this.context,
      ...updates,
    };
  }

  /**
   * Safe check for active cancellation tokens
   */
  public isCancelled(): boolean {
    return this.context.isCancelled;
  }

  /**
   * Triggers the cancellation state
   */
  public cancel(): void {
    this.context.isCancelled = true;
    if (this.context.onCancel) {
      this.context.onCancel();
    }
  }
}
