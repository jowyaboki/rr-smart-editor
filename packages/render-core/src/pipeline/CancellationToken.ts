import { CancellationToken } from './types';

export class CancellationTokenImpl implements CancellationToken {
  private _isCancelled = false;
  private listeners: (() => void)[] = [];

  get isCancellationRequested() {
    return this._isCancelled;
  }

  cancel() {
    if (this._isCancelled) return;
    this._isCancelled = true;
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  throwIfCancellationRequested() {
    if (this._isCancelled) {
      throw new Error('Operation cancelled');
    }
  }

  onCancellationRequested(callback: () => void) {
    this.listeners.push(callback);
    return {
      dispose: () => {
        this.listeners = this.listeners.filter((l) => l !== callback);
      },
    };
  }
}
