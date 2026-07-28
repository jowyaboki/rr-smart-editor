import { EditToolMode } from '../types';

export class NleShortcutService {
  private static playbackSpeed: number = 0; // 0 = stopped, positive = forward, negative = backward
  private static speedStates: number[] = [1, 2, 4, 8];
  private static speedIndex: number = -1;

  private static inPoint: number | null = null;
  private static outPoint: number | null = null;

  public static handleJkl(key: 'j' | 'k' | 'l'): number {
    const k = key.toLowerCase();

    if (k === 'k') {
      this.playbackSpeed = 0;
      this.speedIndex = -1;
    } else if (k === 'l') {
      if (this.playbackSpeed <= 0) {
        this.playbackSpeed = 1;
        this.speedIndex = 0;
      } else {
        // Increment speed index
        this.speedIndex = Math.min(this.speedStates.length - 1, this.speedIndex + 1);
        this.playbackSpeed = this.speedStates[this.speedIndex];
      }
    } else if (k === 'j') {
      if (this.playbackSpeed >= 0) {
        this.playbackSpeed = -1;
        this.speedIndex = 0;
      } else {
        this.speedIndex = Math.min(this.speedStates.length - 1, this.speedIndex + 1);
        this.playbackSpeed = -this.speedStates[this.speedIndex];
      }
    }

    return this.playbackSpeed;
  }

  public static getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public static setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
  }

  public static setInPoint(frame: number): void {
    this.inPoint = frame;
  }

  public static setOutPoint(frame: number): void {
    this.outPoint = frame;
  }

  public static getInPoint(): number | null {
    return this.inPoint;
  }

  public static getOutPoint(): number | null {
    return this.outPoint;
  }

  public static clearPoints(): void {
    this.inPoint = null;
    this.outPoint = null;
  }

  /**
   * Maps keypress to standard NLE EditToolMode.
   */
  public static getModeFromKey(key: string): EditToolMode | null {
    const k = key.toLowerCase();
    switch (k) {
      case 'v': return 'select';
      case 'c': return 'razor';
      case 'b': return 'ripple';
      case 'n': return 'roll';
      case 'y': return 'slip';
      case 'u': return 'slide';
      case 's': return 'stretch';
      case 'h': return 'hand';
      case 'z': return 'zoom';
      default: return null;
    }
  }
}
