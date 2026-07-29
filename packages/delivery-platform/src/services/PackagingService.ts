import { PackagingProfile, MediaPackage } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class PackagingService {
  public async package(inputPath: string, profile: PackagingProfile): Promise<MediaPackage> {
    // Check if plugin is registered
    const packagers = globalDeliveryPluginRegistry.listPackagers();
    for (const pack of packagers) {
      if (pack.supportedFormats.includes(profile.format)) {
        return pack.package(inputPath, profile);
      }
    }

    // Standard simulation packager
    const manifestId = `manifest_${Math.random().toString(36).substr(2, 9)}`;
    const packageId = `pkg_${Math.random().toString(36).substr(2, 9)}`;

    let files: Array<{ path: string; size: number; checksum: string }> = [];

    switch (profile.format) {
      case 'hls':
        files = [
          { path: `master.m3u8`, size: 1024, checksum: 'f1a4e23' },
          { path: `stream_0.m3u8`, size: 2048, checksum: 'e39b4f2' },
          { path: `segment_0.ts`, size: 500000, checksum: '2b4c10a' },
          { path: `segment_1.ts`, size: 520000, checksum: 'd9e03f1' },
        ];
        break;
      case 'mpeg_dash':
        files = [
          { path: `manifest.mpd`, size: 3048, checksum: '9e2a4b1' },
          { path: `video_init.mp4`, size: 10240, checksum: '7b2a1e9' },
          { path: `video_segment_1.m4s`, size: 450000, checksum: 'a1b2c3d' },
        ];
        break;
      case 'cmaf':
        files = [
          { path: `manifest.mpd`, size: 3048, checksum: 'cmaf_mpd' },
          { path: `master.m3u8`, size: 1500, checksum: 'cmaf_m3u8' },
          { path: `chunk_0.cmfv`, size: 250000, checksum: 'chunk0v' },
          { path: `chunk_0.cmfa`, size: 30000, checksum: 'chunk0a' },
        ];
        break;
      case 'zip_archive':
        files = [{ path: `archive.zip`, size: 1024 * 1024 * 10, checksum: 'zip_checksum' }];
        break;
      case 'project_bundle':
        files = [
          { path: `project.json`, size: 1024 * 5, checksum: 'proj_json' },
          { path: `assets/source1.mp4`, size: 1024 * 1024 * 50, checksum: 'src1_chk' },
        ];
        break;
      case 'asset_bundle':
        files = [
          { path: `bundle_metadata.json`, size: 1024 * 2, checksum: 'bndl_meta' },
          { path: `assets/media1.png`, size: 1024 * 1024 * 2, checksum: 'img1_chk' },
        ];
        break;
    }

    return {
      id: packageId,
      manifestId,
      format: profile.format,
      files,
      createdAt: new Date().toISOString(),
    };
  }
}

export const globalPackagingService = new PackagingService();
