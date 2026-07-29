import { ExportPreset } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class PresetService {
  private presets: Map<string, ExportPreset> = new Map();

  constructor() {
    this.registerBuiltInPresets();
  }

  private registerBuiltInPresets(): void {
    const defaultPresets: ExportPreset[] = [
      {
        id: 'youtube_1080p',
        name: 'YouTube HD 1080p',
        description: 'High-quality 1080p H.264 encode optimized for YouTube delivery.',
        format: 'mp4',
        encodingProfile: {
          id: 'enc_yt_1080p',
          name: 'H264 YouTube 1080p Profile',
          videoCodec: 'h264',
          videoBitrateKbps: 8000,
          fps: 30,
          resolution: { width: 1920, height: 1080 },
          aspectRatio: '16:9',
          audioCodec: 'aac',
          audioBitrateKbps: 384,
          audioChannels: 2,
          sampleRateHz: 48000,
        },
        destinations: [
          {
            id: 'dest_local_default',
            name: 'Local Exports Directory',
            type: 'local',
            config: { path: '/tmp/exports' },
          },
        ],
        qcRules: [
          { id: 'qc_missing_assets', type: 'missing_assets', severity: 'error' },
          { id: 'qc_broken_refs', type: 'broken_references', severity: 'error' },
          { id: 'qc_aspect', type: 'aspect_ratio', severity: 'warning', params: { expected: '16:9' } },
        ],
      },
      {
        id: 'broadcast_prores',
        name: 'Broadcast Master ProRes',
        description: 'Apple ProRes 422 HQ Master file for broadcast ingestion.',
        format: 'mov',
        encodingProfile: {
          id: 'enc_prores_master',
          name: 'ProRes 422 HQ Profile',
          videoCodec: 'prores',
          videoBitrateKbps: 220000,
          fps: 29.97,
          resolution: { width: 1920, height: 1080 },
          aspectRatio: '16:9',
          audioCodec: 'pcm',
          audioBitrateKbps: 2304, // 24-bit, 48kHz, 2-ch
          audioChannels: 2,
          sampleRateHz: 48000,
        },
        destinations: [],
        qcRules: [
          { id: 'qc_loudness_r128', type: 'loudness', severity: 'error', params: { targetLUFS: -23, tolerance: 1 } },
          { id: 'qc_clipping', type: 'audio_clipping', severity: 'error' },
        ],
      },
      {
        id: 'hls_adaptive',
        name: 'HLS Adaptive Streaming Bundle',
        description: 'Multi-bitrate HLS package optimized for web delivery.',
        format: 'mp4',
        encodingProfile: {
          id: 'enc_hls_base',
          name: 'H264 HLS Base Profile',
          videoCodec: 'h264',
          videoBitrateKbps: 5000,
          fps: 30,
          resolution: { width: 1920, height: 1080 },
          audioCodec: 'aac',
        },
        packagingProfile: {
          id: 'pkg_hls_standard',
          name: 'Standard HLS Packager',
          format: 'hls',
          segmentDurationSeconds: 6,
        },
        destinations: [],
      },
    ];

    for (const preset of defaultPresets) {
      this.presets.set(preset.id, preset);
    }
  }

  public registerPreset(preset: ExportPreset): void {
    this.presets.set(preset.id, preset);
  }

  public getPreset(id: string): ExportPreset | undefined {
    // Check locally registered presets
    let preset = this.presets.get(id);
    if (preset) return preset;

    // Check plugin-registered preset libraries
    const pluginPresets = globalDeliveryPluginRegistry.listPresetsFromLibraries();
    preset = pluginPresets.find((p) => p.id === id);
    return preset;
  }

  public listPresets(): ExportPreset[] {
    const list = Array.from(this.presets.values());
    const pluginPresets = globalDeliveryPluginRegistry.listPresetsFromLibraries();
    return [...list, ...pluginPresets];
  }
}

export const globalPresetService = new PresetService();
