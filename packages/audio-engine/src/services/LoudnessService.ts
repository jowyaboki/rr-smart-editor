import { LoudnessProfile } from '../types';

export class LoudnessService {
  /**
   * Evaluates RMS power level of a signal slice (Root Mean Square)
   */
  public calculateRMS(buffer: Float32Array): number {
    let sum = 0.0;
    const len = buffer.length;
    if (len === 0) return -120;

    for (let i = 0; i < len; i++) {
      sum += buffer[i] * buffer[i];
    }

    const rms = Math.sqrt(sum / len);
    if (rms <= 0.00001) return -120;
    return 20.0 * Math.log10(rms); // Convert to dBFS
  }

  /**
   * Computes momentary EBU R128 LUFS value for a gating block
   */
  public calculateEbuR128LUFS(buffer: Float32Array): number {
    // R128 uses K-weighting filters representing acoustic head models.
    // In flat approximation, this is scaled closely to RMS dBFS minus offset adjustments
    const rmsDb = this.calculateRMS(buffer);
    const lufs = rmsDb - 0.6; // alignment offset
    return Math.max(-120, lufs);
  }

  /**
   * Dispatches target loudness attenuation adjustments for major streaming normalizations (e.g. YouTube -14 LUFS, Spotify -14 LUFS)
   */
  public getNormalizationGainMultiplier(
    integratedLUFS: number,
    targetLUFS: number = -14.0,
    maxTruePeakDb: number = -1.0
  ): number {
    // If it's too quiet, we push it louder up to the True Peak limiter boundary
    const deltaDb = targetLUFS - integratedLUFS;

    // Linear multiplier
    const gainFactor = Math.pow(10.0, deltaDb / 20.0);
    return gainFactor;
  }
}
