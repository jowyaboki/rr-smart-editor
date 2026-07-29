import { EncodingProfile } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class EncodingService {
  public async encode(
    inputPath: string,
    profile: EncodingProfile,
    onProgress?: (progress: number) => void
  ): Promise<{ outputPath: string; size: number }> {
    // 1. Check if there is an encoder plugin registered that supports this video/audio codec
    const encoders = globalDeliveryPluginRegistry.listEncoders();
    const videoCodec = profile.videoCodec;
    const audioCodec = profile.audioCodec;

    if (videoCodec || audioCodec) {
      for (const enc of encoders) {
        const videoSupported = !videoCodec || enc.supportedVideoCodecs.includes(videoCodec);
        const audioSupported = !audioCodec || enc.supportedAudioCodecs.includes(audioCodec);
        if (videoSupported && audioSupported) {
          return enc.encode(inputPath, profile);
        }
      }
    }

    // 2. Default provider-independent encoder simulation
    // Simulating encoding duration and progress updates
    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      if (onProgress) {
        onProgress((i / totalSteps) * 100);
      }
      await new Promise((r) => setTimeout(r, 10)); // simulated short delay
    }

    // Support simulated encoding failure
    if (profile.customSettings?.simulateFailure) {
      throw new Error(`Encoding failed: ${profile.customSettings.simulateFailure}`);
    }

    const ext = profile.customSettings?.extension || 'mp4';
    const outputPath = inputPath.replace(/\.[^/.]+$/, '') + `_encoded.${ext}`;
    const size = profile.videoBitrateKbps ? profile.videoBitrateKbps * 1024 : 1024 * 50; // mock size calculations

    return {
      outputPath,
      size,
    };
  }
}

export const globalEncodingService = new EncodingService();
