import { ProxyAsset } from '../types';

export class ProxyService {
  /**
   * Generates low or medium resolution video proxy asset.
   */
  public static async generateProxy(
    assetId: string,
    quality: 'low' | 'medium',
    inputPath: string
  ): Promise<ProxyAsset> {
    // Mimic background transcode latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      id: `proxy_${Date.now()}_${quality}`,
      assetId,
      quality,
      filepath: inputPath.replace(/\.[^/.]+$/, `_proxy_${quality}.mp4`),
      size: Math.round(1024 * 1024 * 2.5), // 2.5 MB proxy size
      status: 'completed',
    };
  }
}
