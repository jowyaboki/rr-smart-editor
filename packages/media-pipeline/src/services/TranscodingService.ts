export class TranscodingService {
  /**
   * Mock Transcoding processor. Converts video file format into target containers.
   * Emits progress callbacks asynchronously.
   */
  public static async transcode(
    inputPath: string,
    outputFormat: 'mp4' | 'mov' | 'webm' | 'audio_only',
    onProgress: (percent: number) => void
  ): Promise<{ success: boolean; outputPath: string; size: number }> {
    return new Promise((resolve) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 20;
        onProgress(percent);

        if (percent >= 100) {
          clearInterval(interval);
          resolve({
            success: true,
            outputPath: inputPath.replace(/\.[^/.]+$/, `_transcoded.${outputFormat === 'audio_only' ? 'mp3' : outputFormat}`),
            size: Math.round(1024 * 1024 * 5), // 5 MB transcoded file
          });
        }
      }, 50);
    });
  }
}
