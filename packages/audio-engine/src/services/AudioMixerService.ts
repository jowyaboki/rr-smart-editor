import { AudioMixer } from '../types';

export class AudioMixerService {
  /**
   * Translates decibel level to linear gain multiplier factor
   * Formula: gain = 10^(db / 20)
   */
  public dbToLinear(db: number): number {
    if (db <= -120) return 0.0; // absolute silence floor
    return Math.pow(10.0, db / 20.0);
  }

  /**
   * Translates linear gain factor back to decibels
   * Formula: db = 20 * log10(gain)
   */
  public linearToDb(gain: number): number {
    if (gain <= 0.00001) return -120;
    return 20.0 * Math.log10(gain);
  }

  /**
   * Solves constant-power panning laws to balance stereo channel outputs
   * Angle-based panning: L = cos(p), R = sin(p)
   */
  public calculateStereoPan(pan: number): [number, number] {
    // pan is -1.0 (hard left) to 1.0 (hard right)
    const p = (pan + 1.0) / 2.0; // scale to 0 to 1
    const angle = p * (Math.PI / 2.0); // scale to 0 to 90 deg

    const left = Math.cos(angle);
    const right = Math.sin(angle);

    return [left, right];
  }

  /**
   * Solves panning coefficients for 5.1 surround speaker configurations
   * Outputs: [Left, Right, Center, LFE, LeftSurround, RightSurround]
   */
  public calculate51Pan(panX: number, panY: number): [number, number, number, number, number, number] {
    // Simplified 2D placement layout
    const x = (panX + 1) / 2; // 0 to 1
    const y = (panY + 1) / 2; // 0 to 1 (0 = back, 1 = front)

    const leftFront = x < 0.5 ? (1 - x * 2) * y : 0;
    const rightFront = x > 0.5 ? (x - 0.5) * 2 * y : 0;
    const center = Math.max(0, 1 - Math.abs(panX) * 2) * y;
    const lfe = 0.1; // Dedicated low freq multiplier limit

    const leftSurround = x < 0.5 ? (1 - x * 2) * (1 - y) : 0;
    const rightSurround = x > 0.5 ? (x - 0.5) * 2 * (1 - y) : 0;

    return [leftFront, rightFront, center, lfe, leftSurround, rightSurround];
  }
}
