import { MediaAsset, AssetVersion, MetadataProfile } from '../types';

export class VersionService {
  public createNewVersion(
    asset: MediaAsset,
    url: string,
    size: number,
    checksum: string,
    createdBy: string,
    changelog?: string,
    isApprovalVersion?: boolean,
    customMetadata?: MetadataProfile
  ): AssetVersion {
    const nextNumber = asset.currentVersionNumber + 1;
    const versionId = `ver_${asset.id}_v${nextNumber}`;

    const newVer: AssetVersion = {
      id: versionId,
      assetId: asset.id,
      versionNumber: nextNumber,
      url,
      size,
      checksum,
      createdBy,
      createdAt: new Date().toISOString(),
      changelog,
      isApprovalVersion,
      metadata: customMetadata || asset.metadata,
    };

    asset.versions.push(newVer);
    asset.currentVersionNumber = nextNumber;
    asset.url = url;
    asset.updatedAt = new Date().toISOString();

    if (customMetadata) {
      asset.metadata = customMetadata;
    }

    return newVer;
  }

  public restoreVersion(asset: MediaAsset, versionNumber: number): AssetVersion {
    const ver = asset.versions.find((v) => v.versionNumber === versionNumber);
    if (!ver) {
      throw new Error(`Version ${versionNumber} does not exist on Asset '${asset.id}'`);
    }

    // Set active values back to target version
    asset.url = ver.url;
    asset.currentVersionNumber = ver.versionNumber;
    if (ver.metadata) {
      asset.metadata = ver.metadata;
    }
    asset.updatedAt = new Date().toISOString();

    return ver;
  }

  public compareVersions(
    v1: AssetVersion,
    v2: AssetVersion
  ): {
    sizeDifferenceBytes: number;
    metadataChanges: Array<{ field: string; from: any; to: any }>;
  } {
    const changes: Array<{ field: string; from: any; to: any }> = [];

    // Compare tags
    const tags1 = v1.metadata?.aiGeneratedTags || [];
    const tags2 = v2.metadata?.aiGeneratedTags || [];

    if (JSON.stringify(tags1) !== JSON.stringify(tags2)) {
      changes.push({
        field: 'aiGeneratedTags',
        from: tags1,
        to: tags2,
      });
    }

    // Compare custom metadata
    const custom1 = v1.metadata?.customMetadata || {};
    const custom2 = v2.metadata?.customMetadata || {};

    for (const key of new Set([...Object.keys(custom1), ...Object.keys(custom2)])) {
      if (custom1[key] !== custom2[key]) {
        changes.push({
          field: `customMetadata.${key}`,
          from: custom1[key],
          to: custom2[key],
        });
      }
    }

    return {
      sizeDifferenceBytes: v2.size - v1.size,
      metadataChanges: changes,
    };
  }
}

export const globalVersionService = new VersionService();
