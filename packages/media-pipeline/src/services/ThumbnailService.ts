import { ThumbnailAsset } from '../types';

export class ThumbnailService {
  /**
   * Extract poster frame thumbnail.
   */
  public static async generateThumbnail(
    assetId: string,
    inputPath: string,
    offsetSec: number = 2.0
  ): Promise<ThumbnailAsset> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      id: `thumb_${Date.now()}`,
      assetId,
      filepath: inputPath.replace(/\.[^/.]+$/, '_thumb.jpg'),
      posterFrameOffsetSec: offsetSec,
    };
  }

  /**
   * Generates a combined grid thumbnail contact sheet.
   */
  public static async generateContactSheet(
    inputPath: string,
    gridSize: { cols: number; rows: number }
  ): Promise<string> {
    return inputPath.replace(/\.[^/.]+$/, '_contact_sheet.jpg');
  }
}
