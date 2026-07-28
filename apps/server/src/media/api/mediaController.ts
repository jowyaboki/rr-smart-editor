import { MediaImportService, AnalysisService, ProxyService, ThumbnailService, WaveformService, TranscodingService } from '@ai-video-editor/media-pipeline';

export class ServerMediaController {
  /**
   * Orchestrates the complete media ingestion pipeline on server side.
   * Runs local-first background analysis, proxy transcode, thumbnail, and waveforms.
   */
  public static async handleIngest(
    filename: string,
    size: number,
    filepath: string
  ): Promise<any> {
    // 1. Create a background import job
    const job = MediaImportService.createImportJob(filename, size, filepath);
    MediaImportService.updateJob(job.id, 'processing', 10);

    try {
      const fingerprint = MediaImportService.generateFingerprint(filename, size);

      // 2. Extract detailed Metadata (Analysis stage)
      const metadata = AnalysisService.analyzeMedia(filepath, filename, size, fingerprint);
      MediaImportService.updateJob(job.id, 'processing', 40);

      // 3. Generate Proxies and Waveforms (Processing stage)
      const lowProxy = await ProxyService.generateProxy(job.assetId, 'low', filepath);
      const thumbnail = await ThumbnailService.generateThumbnail(job.assetId, filepath);

      let waveform = undefined;
      if (filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.mp3')) {
        waveform = await WaveformService.generateWaveform(job.assetId, filepath);
      }
      MediaImportService.updateJob(job.id, 'processing', 80);

      // 4. Assemble complete MediaAsset
      const asset = {
        id: job.assetId,
        filename,
        filepath,
        type: filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'audio' : 'video',
        size,
        fingerprint,
        metadata,
        proxy: { low: lowProxy },
        thumbnail,
        waveform,
      };

      // 5. Register in searchable index
      MediaImportService.registerAsset(asset);
      MediaImportService.updateJob(job.id, 'completed', 100);

      return {
        success: true,
        asset,
        job,
      };
    } catch (err: any) {
      MediaImportService.updateJob(job.id, 'failed', 0, err.message || String(err));
      throw err;
    }
  }

  /**
   * Action: starts a background container transcoding run.
   */
  public static async handleTranscode(
    inputPath: string,
    targetFormat: 'mp4' | 'webm' | 'mov'
  ): Promise<any> {
    const transcoded = await TranscodingService.transcode(inputPath, targetFormat, (percent) => {
      console.log(`Transcoding progress: ${percent}%`);
    });
    return transcoded;
  }
}
