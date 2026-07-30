import { PlatformModule, LifecycleState } from '../types';

export class LifecycleManager {
  public transitionState(module: PlatformModule, targetState: LifecycleState): void {
    module.state = targetState;
  }
}

export const globalLifecycleManager = new LifecycleManager();
export default globalLifecycleManager;
