import { Request, Response } from 'express';
import {
  globalMediaManagementPlatformEngine,
  MediaAsset,
  AssetFolder,
  AssetCollection,
  License,
} from '@ai-video-editor/media-management';

export class MediaManagementController {
  public async listAssets(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.query;
      const list = globalMediaManagementPlatformEngine.catalogService.listAssets(folderId as string);
      res.json({ success: true, assets: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }
      res.json({ success: true, asset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async ingestAsset(req: Request, res: Response): Promise<void> {
    try {
      const { name, url, folderId, size, mimeType } = req.body;
      if (!name || !url) {
        res.status(400).json({ success: false, error: 'name and url are required.' });
        return;
      }

      // 1. Process technical and profile metadata using services
      const tech = await globalMediaManagementPlatformEngine.metadataService.extractTechnicalMetadata(
        url,
        size || 1024 * 100,
        mimeType || 'video/mp4'
      );

      const folder = folderId ? globalMediaManagementPlatformEngine.catalogService.getFolder(folderId) : undefined;
      const metadata = await globalMediaManagementPlatformEngine.metadataService.compileMetadataProfile(url, folder);

      const assetId = `asset_${Math.random().toString(36).substr(2, 9)}`;

      const newAsset: MediaAsset = {
        id: assetId,
        name,
        url,
        folderId,
        checksum: `chk_${Math.random().toString(36).substr(2, 9)}`,
        technicalMetadata: tech,
        metadata,
        currentVersionNumber: 1,
        versions: [
          {
            id: `ver_${assetId}_v1`,
            assetId,
            versionNumber: 1,
            url,
            size: size || 1024 * 100,
            checksum: `chk_${Math.random().toString(36).substr(2, 9)}`,
            createdBy: 'Admin',
            createdAt: new Date().toISOString(),
          },
        ],
        lifecycleState: 'online',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      globalMediaManagementPlatformEngine.catalogService.registerAsset(newAsset);
      res.status(201).json({ success: true, asset: newAsset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { url, size, checksum, createdBy, changelog, customMetadata } = req.body;

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }

      const nextVersion = globalMediaManagementPlatformEngine.versionService.createNewVersion(
        asset,
        url,
        size || 1024 * 100,
        checksum || `chk_${Math.random().toString(36).substr(2, 9)}`,
        createdBy || 'Admin',
        changelog,
        false,
        customMetadata
      );

      res.status(201).json({ success: true, version: nextVersion, asset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async restoreVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id, versionNumber } = req.params;

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }

      const ver = globalMediaManagementPlatformEngine.versionService.restoreVersion(asset, parseInt(versionNumber, 10));
      res.json({ success: true, restoredVersion: ver, asset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async assignRights(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const license: License = req.body;

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }

      const rights = globalMediaManagementPlatformEngine.rightsService.assignLicense(asset, license);
      res.json({ success: true, rights, asset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async validateRights(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { territory } = req.query;

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }

      const clearance = await globalMediaManagementPlatformEngine.rightsService.validateTerritoryUsage(
        asset,
        (territory as string) || 'US'
      );
      res.json({ success: true, clearance });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async submitApproval(req: Request, res: Response): Promise<void> {
    try {
      const { assetId, versionId, requestedBy, approvers } = req.body;

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${assetId}' not found.` });
        return;
      }

      const reqObj = globalMediaManagementPlatformEngine.approvalService.submitForApproval(
        asset,
        versionId,
        requestedBy || 'Admin',
        approvers || ['Lead_Reviewer']
      );

      res.status(201).json({ success: true, approvalRequest: reqObj });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async voteApproval(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approver, vote, comment } = req.body;

      const reqObj = globalMediaManagementPlatformEngine.approvalService.recordReviewVote(
        id,
        approver,
        vote,
        comment
      );

      res.json({ success: true, approvalRequest: reqObj });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async transitionTier(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { tier } = req.body; // 'online' | 'nearline' | 'cold'

      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(id);
      if (!asset) {
        res.status(404).json({ success: false, error: `MediaAsset '${id}' not found.` });
        return;
      }

      await globalMediaManagementPlatformEngine.archiveService.migrateStorageTier(asset, tier);
      res.json({ success: true, asset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listFolders(req: Request, res: Response): Promise<void> {
    try {
      const folders = globalMediaManagementPlatformEngine.catalogService.listFolders();
      res.json({ success: true, folders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const { name, parentId, inheritedMetadata } = req.body;
      if (!name) {
        res.status(400).json({ success: false, error: 'Folder name is required.' });
        return;
      }

      const folder: AssetFolder = {
        id: `folder_${Math.random().toString(36).substr(2, 9)}`,
        name,
        parentId,
        inheritedMetadata,
        createdAt: new Date().toISOString(),
      };

      globalMediaManagementPlatformEngine.catalogService.registerFolder(folder);
      res.status(201).json({ success: true, folder });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listCollections(req: Request, res: Response): Promise<void> {
    try {
      const colls = globalMediaManagementPlatformEngine.catalogService.listCollections();
      res.json({ success: true, collections: colls });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, smartCriteria } = req.body;
      if (!name || !type) {
        res.status(400).json({ success: false, error: 'name and type are required.' });
        return;
      }

      const col: AssetCollection = {
        id: `coll_${Math.random().toString(36).substr(2, 9)}`,
        name,
        assetIds: [],
        type,
        smartCriteria,
        createdAt: new Date().toISOString(),
      };

      globalMediaManagementPlatformEngine.catalogService.registerCollection(col);
      res.status(201).json({ success: true, collection: col });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const mediaManagementController = new MediaManagementController();
export default mediaManagementController;
