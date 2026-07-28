import { AudioAnalysis } from '../types';

export class AnalysisService {
  /**
   * Scans a sample buffer to identify clipping thresholds (> 1.0 or < -1.0)
   */
  public detectClipping(buffer: Float32Array): boolean {
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      if (Math.abs(buffer[i]) >= 0.9999) {
        return true; // Digital Clipping Alert triggered
      }
    }
    return false;
  }

  /**
   * Performs quick transient peak detection to locate drum hits or dialogues starting
   */
  public detectTransients(buffer: Float32Array, windowSize: number = 512): number[] {
    const peaks: number[] = [];
    const len = buffer.length;

    let prevEnergy = 0.001;

    for (let i = 0; i < len; i += windowSize) {
      const slice = buffer.subarray(i, Math.min(len, i + windowSize));
      let energy = 0.0;
      for (let j = 0; j < slice.length; j++) {
        energy += slice[j] * slice[j];
      }
      energy = Math.sqrt(energy / (slice.length || 1));

      // Check ratio spike
      const ratio = energy / prevEnergy;
      if (ratio > 2.5 && energy > 0.05) {
        peaks.push(i); // transient located at frame index i
      }

      prevEnergy = energy || 0.001;
    }

    return peaks;
  }
}
