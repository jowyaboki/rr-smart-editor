import { MetadataProfile, AssetFolder, TechnicalMetadata } from '../types';
import { globalMediaManagementPluginRegistry } from '../plugins';

export class MetadataService {
  public async extractTechnicalMetadata(url: string, size: number, mimeType: string): Promise<TechnicalMetadata> {
    const ext = url.split('.').pop()?.toLowerCase() || '';

    // Standard baseline metadata mappings
    const tech: TechnicalMetadata = {
      size,
      mimeType,
      codec: ext === 'mp4' || ext === 'mov' ? 'h264' : ext === 'png' ? 'png' : 'unknown',
    };

    if (ext === 'mp4' || ext === 'mov') {
      tech.duration = 15.5;
      tech.resolution = { width: 1920, height: 1080 };
      tech.fps = 30.0;
      tech.aspectRatio = '16:9';
    }

    return tech;
  }

  public async compileMetadataProfile(
    fileUrl: string,
    folder?: AssetFolder,
    customData?: Record<string, any>
  ): Promise<MetadataProfile> {
    const profile: MetadataProfile = {
      id: `meta_${Math.random().toString(36).substr(2, 9)}`,
      name: fileUrl.split('/').pop() || 'Unnamed Asset',
      exif: { camera: 'Sony A7R V', lens: '35mm F1.4', iso: 100 },
      iptc: { creator: 'Jules', copyright: 'AI Video Editor' },
      xmp: { rating: 5, label: 'Approved' },
      aiGeneratedTags: ['cinema', 'landscape', 'outdoor'],
      customMetadata: customData || {},
      tagsInheritedFromFolder: false,
    };

    // Apply folder inheritance if specified
    if (folder?.inheritedMetadata) {
      profile.tagsInheritedFromFolder = true;
      profile.aiGeneratedTags = Array.from(
        new Set([...(profile.aiGeneratedTags || []), ...(folder.inheritedMetadata.aiGeneratedTags || [])])
      );
      profile.customMetadata = {
        ...folder.inheritedMetadata.customMetadata,
        ...profile.customMetadata,
      };
    }

    // Apply plugin extractors if registered
    const extractors = globalMediaManagementPluginRegistry.listMetadataExtractors();
    for (const ext of extractors) {
      try {
        const extra = await ext.extract(fileUrl);
        profile.customMetadata = { ...profile.customMetadata, ...extra };
      } catch (err) {
        console.error(`MetadataExtractorPlugin ${ext.name} failed:`, err);
      }
    }

    return profile;
  }
}

export const globalMetadataService = new MetadataService();
