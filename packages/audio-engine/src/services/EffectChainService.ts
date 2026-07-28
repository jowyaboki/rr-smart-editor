import { AudioEffect, AudioChain } from '../types';

export class EffectChainService {
  /**
   * Translates EQ parameter values to standard biquad coefficient targets
   */
  public compileBiquadEQ(
    frequency: number,
    gainDb: number,
    q: number,
    sampleRate: number = 48000
  ): { b0: number; b1: number; b2: number; a1: number; a2: number } {
    // Standard Peaking EQ Biquad Filter Formula (Robert Bristow-Johnson)
    const w0 = (2 * Math.PI * frequency) / sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    const A = Math.pow(10, gainDb / 40);

    const b0 = 1 + alpha * A;
    const b1 = -2 * Math.cos(w0);
    const b2 = 1 - alpha * A;
    const a0 = 1 + alpha / A;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha / A;

    // Normalize by dividing by a0
    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
    };
  }

  /**
   * Compiles dynamic range limiter ratios
   */
  public compileLimiter(thresholdDb: number, releaseMs: number): Record<string, any> {
    return {
      thresholdLinear: Math.pow(10.0, thresholdDb / 20.0),
      releaseSamples: (releaseMs / 1000) * 48000,
    };
  }
}
