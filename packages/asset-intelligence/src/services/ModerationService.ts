import { Asset } from '@ai-video-editor/dam';
import { ModerationResult } from '../types';

export class ModerationService {
  /**
   * Scans a target asset and evaluates health & compliance flags
   */
  public async moderate(asset: Asset, library: Asset[]): Promise<ModerationResult> {
    const reasons: Array<ModerationResult['flagReasons'][number]> = [];
    let details = 'Asset is completely clean, high-quality and compliant.';

    // 1. Check for duplicate hashes (checksum)
    const isDuplicate = library.some(a => a.id !== asset.id && a.checksum === asset.checksum);
    if (isDuplicate) {
      reasons.push('duplicate');
    }

    // 2. Low-quality checks (e.g., small dimension sizes or very short files)
    const res = asset.metadata.resolution;
    if (res && (res.width < 640 || res.height < 480)) {
      reasons.push('low_quality');
    }

    // 3. Corrupt checks
    if (asset.url && (asset.url.includes('corrupt') || asset.checksum === '00000000000000000000000000000000')) {
      reasons.push('corrupt_media');
    }

    // 4. Inappropriate content checks
    const tags = asset.metadata.aiGeneratedTags || [];
    const keywords = asset.metadata.keywords || [];
    const hasUnsafe = tags.some(t => t.includes('violence') || t.includes('nsfw') || t.includes('inappropriate')) ||
                      keywords.some(k => k.includes('violence') || k.includes('inappropriate'));
    if (hasUnsafe) {
      reasons.push('inappropriate_content');
    }

    // 5. Missing critical metadata check
    if (!asset.metadata.title || !asset.metadata.description || asset.metadata.title === 'Untitled') {
      reasons.push('missing_metadata');
    }

    if (reasons.length > 0) {
      details = `Moderator warning flags: ${reasons.join(', ')}. Action recommended.`;
    }

    return {
      assetId: asset.id,
      isFlagged: reasons.length > 0,
      flagReasons: reasons,
      confidenceScore: 0.95,
      details,
      moderatedAt: new Date().toISOString(),
    };
  }
}
