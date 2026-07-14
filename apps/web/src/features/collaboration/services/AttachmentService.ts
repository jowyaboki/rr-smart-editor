import { Attachment } from '@ai-video-editor/shared';

export class AttachmentService {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

  /**
   * Validates and instantiates an attachment.
   */
  public static createAttachment(name: string, url: string, sizeBytes: number): Attachment {
    if (sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File size exceeds the maximum limit of 10MB (got ${Number((sizeBytes / 1024 / 1024).toFixed(2))}MB)`,
      );
    }

    const id = `attach_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    return {
      id,
      name,
      url,
      sizeBytes,
    };
  }
}
