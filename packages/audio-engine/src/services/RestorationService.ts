export interface RestorationProviderAdapter {
  id: string;
  name: string;
  removeNoise(buffer: Float32Array, threshold: number): Promise<Float32Array>;
  removeHum(buffer: Float32Array, frequency: number): Promise<Float32Array>;
}

export class RestorationService {
  private providers = new Map<string, RestorationProviderAdapter>();

  public registerProvider(provider: RestorationProviderAdapter): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Applies silences/gaps extraction (Automatic Trimming & Silence Detection)
   */
  public detectSilence(
    buffer: Float32Array,
    thresholdDb: number = -45.0,
    sampleRate: number = 48000
  ): Array<{ startFrame: number; endFrame: number }> {
    const segments: Array<{ startFrame: number; endFrame: number }> = [];
    const windowSize = 2400; // 50ms windows at 48kHz
    const len = buffer.length;

    let inSilence = false;
    let silenceStart = 0;

    for (let i = 0; i < len; i += windowSize) {
      const slice = buffer.subarray(i, Math.min(len, i + windowSize));

      // Compute window power RMS in dB
      let sum = 0.0;
      for (let j = 0; j < slice.length; j++) {
        sum += slice[j] * slice[j];
      }
      const rms = Math.sqrt(sum / (slice.length || 1));
      const db = rms > 0.00001 ? 20.0 * Math.log10(rms) : -120;

      if (db < thresholdDb) {
        if (!inSilence) {
          inSilence = true;
          silenceStart = i;
        }
      } else {
        if (inSilence) {
          inSilence = false;
          segments.push({ startFrame: silenceStart, endFrame: i });
        }
      }
    }

    if (inSilence) {
      segments.push({ startFrame: silenceStart, endFrame: len });
    }

    return segments;
  }
}
