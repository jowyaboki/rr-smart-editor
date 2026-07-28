import { WaveformAsset } from '../types';

export class WaveformService {
  /**
   * Extract peak amplitudes from audio stream to build waveform.
   */
  public static async generateWaveform(
    assetId: string,
    inputPath: string
  ): Promise<WaveformAsset> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Generate 100 mock normalized wave peak amplitudes
    const peaks: number[] = [];
    for (let i = 0; i < 100; i++) {
      peaks.push(Math.abs(Math.sin(i * 0.15) * Math.cos(i * 0.05)));
    }

    return {
      id: `wave_${Date.now()}`,
      assetId,
      peaks,
      channels: 2,
    };
  }
}
