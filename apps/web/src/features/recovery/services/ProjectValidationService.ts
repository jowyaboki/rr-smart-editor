import { ProjectSnapshot } from '@ai-video-editor/shared';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class ProjectValidationService {
  /**
   * Generates a simple, robust synchronous hash of a string for corruption detection.
   */
  public static calculateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generates a hash specifically for a ProjectSnapshot's contents to verify its integrity.
   */
  public static generateSnapshotHash(snapshot: Omit<ProjectSnapshot, 'metadata'> | any): string {
    const contentToHash = JSON.stringify({
      id: snapshot.id,
      projectId: snapshot.projectId,
      name: snapshot.name,
      timeline: snapshot.timeline,
      assets: snapshot.assets,
      scenes: snapshot.scenes || [],
      templates: snapshot.templates || null,
      brandKit: snapshot.brandKit || null,
      settings: snapshot.settings || null,
    });
    return this.calculateHash(contentToHash);
  }

  /**
   * Validates the schema of a project object.
   */
  public static validateSchema(project: any): ValidationResult {
    const errors: string[] = [];

    if (!project) {
      return { isValid: false, errors: ['Project data is null or undefined'] };
    }

    if (typeof project !== 'object') {
      return { isValid: false, errors: ['Project data must be an object'] };
    }

    if (!project.id || typeof project.id !== 'string') {
      errors.push('Project missing valid "id" string');
    }

    if (!project.name || typeof project.name !== 'string') {
      errors.push('Project missing valid "name" string');
    }

    if (!project.timeline) {
      errors.push('Project missing "timeline" data');
    } else {
      const { tracks } = project.timeline;
      if (!Array.isArray(tracks)) {
        errors.push('Timeline "tracks" must be an array');
      } else {
        tracks.forEach((track: any, trackIdx: number) => {
          if (!track.id || typeof track.id !== 'string') {
            errors.push(`Track at index ${trackIdx} missing "id"`);
          }
          if (!track.name || typeof track.name !== 'string') {
            errors.push(`Track ${track.id || trackIdx} missing "name"`);
          }
          if (!Array.isArray(track.clips)) {
            errors.push(`Track ${track.id || trackIdx} "clips" must be an array`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Detects broken references and missing assets.
   */
  public static validateReferences(project: any, availableAssets: any[] = []): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const assetMap = new Map<string, any>();

    availableAssets.forEach((asset) => {
      if (asset && asset.id) {
        assetMap.set(asset.id, asset);
      }
    });

    const schemaValidation = this.validateSchema(project);
    if (!schemaValidation.isValid) {
      return schemaValidation;
    }

    const { tracks } = project.timeline;
    tracks.forEach((track: any) => {
      if (Array.isArray(track.clips)) {
        track.clips.forEach((clip: any, clipIdx: number) => {
          // Check core clip attributes
          if (!clip.id || typeof clip.id !== 'string') {
            errors.push(`Track ${track.id} contains a clip at index ${clipIdx} missing an ID`);
            return;
          }

          if (typeof clip.start !== 'number' || isNaN(clip.start)) {
            errors.push(`Clip ${clip.id} has an invalid "start" frame`);
          }

          if (typeof clip.duration !== 'number' || isNaN(clip.duration) || clip.duration <= 0) {
            errors.push(`Clip ${clip.id} has an invalid "duration"`);
          }

          if (clip.trackId !== track.id) {
            warnings.push(
              `Clip ${clip.id} has trackId "${clip.trackId}" but resides in track "${track.id}"`,
            );
          }

          // Check asset references if applicable
          if (clip.mediaId) {
            const asset = assetMap.get(clip.mediaId);
            if (!asset) {
              errors.push(`Clip ${clip.id} references missing asset mediaId: "${clip.mediaId}"`);
            } else if (clip.url && asset.url && clip.url !== asset.url) {
              warnings.push(
                `Clip ${clip.id} url "${clip.url}" differs from asset url "${asset.url}"`,
              );
            }
          } else if (clip.type !== 'text' && !clip.url) {
            errors.push(
              `Non-text Clip ${clip.id} of type "${clip.type}" is missing both mediaId and url`,
            );
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates snapshot integrity by recalculating and comparing its hash.
   */
  public static validateSnapshotIntegrity(snapshot: ProjectSnapshot): ValidationResult {
    const errors: string[] = [];

    if (!snapshot) {
      return { isValid: false, errors: ['Snapshot is null or undefined'] };
    }

    if (!snapshot.metadata) {
      return { isValid: false, errors: ['Snapshot is missing "metadata"'] };
    }

    const schemaValidation = this.validateSchema(snapshot);
    if (!schemaValidation.isValid) {
      return schemaValidation;
    }

    // Verify hash
    const expectedHash = this.generateSnapshotHash(snapshot);
    if (snapshot.metadata.hash !== expectedHash) {
      errors.push(
        `Snapshot corrupted: hash mismatch (Expected "${expectedHash}", got "${snapshot.metadata.hash}")`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
