import { HDRProfile } from '../types';

export class HDRService {
  /**
   * Electro-Optical Transfer Function (EOTF) for SMPTE ST 2084 (PQ Curve)
   */
  public pqDecode(n: number): number {
    const m1 = 2610 / 16384;
    const m2 = 2523 / 4096 * 128;
    const c1 = 3424 / 4096;
    const c2 = 2413 / 4096 * 32;
    const c3 = 2392 / 4096 * 32;

    const np = Math.pow(Math.max(0, n), 1.0 / m2);
    const num = Math.max(0, np - c1);
    const den = c2 - c3 * np;
    const val = Math.pow(num / (den || 1), 1.0 / m1);

    return val * 10000; // Returns absolute nit value
  }

  /**
   * Optical-Electro Transfer Function (OETF) for SMPTE ST 2084 (PQ Curve)
   */
  public pqEncode(nits: number): number {
    const y = Math.max(0, nits) / 10000;
    const m1 = 2610 / 16384;
    const m2 = 2523 / 4096 * 128;
    const c1 = 3424 / 4096;
    const c2 = 2413 / 4096 * 32;
    const c3 = 2392 / 4096 * 32;

    const ym = Math.pow(y, m1);
    const num = c1 + c2 * ym;
    const den = 1.0 + c3 * ym;
    return Math.pow(num / den, m2);
  }

  /**
   * Reinhard Tone Mapping operator: output = input / (input + 1)
   */
  public reinhardToneMap(rgb: [number, number, number], peakLuminance: number = 1.0): [number, number, number] {
    const process = (v: number) => {
      const mapped = v / (v + 1.0);
      return mapped / (peakLuminance || 1.0);
    };

    return [process(rgb[0]), process(rgb[1]), process(rgb[2])];
  }

  /**
   * ACES Tone Mapping Approximation
   */
  public acesToneMap(rgb: [number, number, number]): [number, number, number] {
    const process = (x: number) => {
      const a = 2.51;
      const b = 0.03;
      const c = 2.43;
      const d = 0.59;
      const e = 0.14;
      return Math.min(1.0, Math.max(0, (x * (a * x + b)) / (x * (c * x + d) + e)));
    };

    return [process(rgb[0]), process(rgb[1]), process(rgb[2])];
  }
}
