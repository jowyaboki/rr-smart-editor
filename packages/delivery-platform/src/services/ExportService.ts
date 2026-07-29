import { RenderArtifact } from '@ai-video-editor/shared';
import { ExportFormat } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class ExportService {
  public async export(
    artifact: RenderArtifact,
    format: ExportFormat,
    options?: any
  ): Promise<{ outputPath: string; size: number }> {
    // 1. Check if plugin is registered
    const exporters = globalDeliveryPluginRegistry.listExporters();
    for (const exp of exporters) {
      if (exp.supportedFormats.includes(format)) {
        return exp.export(artifact, format, options);
      }
    }

    // 2. Default export format logic (simulation)
    await new Promise((r) => setTimeout(r, 20)); // simulated archive/compile step

    let size = artifact.size;
    let ext = 'mp4';

    switch (format) {
      case 'image_sequence':
        size = artifact.size * 1.5; // unpacked images are usually larger
        ext = 'zip'; // zipped sequence
        break;
      case 'gif':
        size = artifact.size * 0.4;
        ext = 'gif';
        break;
      case 'animated_webp':
        size = artifact.size * 0.3;
        ext = 'webp';
        break;
      case 'audio_only':
        size = artifact.size * 0.1;
        ext = 'mp3';
        break;
      case 'project_archive':
        size = artifact.size * 2.5; // includes assets + timeline json
        ext = 'zip';
        break;
      default:
        ext = format;
        break;
    }

    const outputPath = artifact.url.replace(/\.[^/.]+$/, '') + `_export.${ext}`;

    return {
      outputPath,
      size,
    };
  }
}

export const globalExportService = new ExportService();
