import { Router, Request, Response } from 'express';
import { query } from '../db';
import { handleError, ApiError } from '../utils/errors';

const router = Router();

// Upload asset with smart deduplication & CDN reference
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { organizationId, name, type, size, sha256Hash, url } = req.body;
    if (!organizationId || !name || !type || !size || !sha256Hash || !url) {
      res.status(400).json({ success: false, error: 'organizationId, name, type, size, sha256Hash, and url are required' });
      return;
    }

    // 1. Deduplication check under this Organization
    const existing = await query(
      'SELECT * FROM cloud_assets WHERE organization_id = $1 AND sha256_hash = $2 ORDER BY version DESC LIMIT 1',
      [organizationId, sha256Hash]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      // Deduplicated match found! Reuse the existing file reference and increment version
      const asset = existing.rows[0];
      const nextVersion = asset.version + 1;

      const newVersionRes = await query(
        'INSERT INTO cloud_assets (organization_id, name, type, size, url, sha256_hash, version, storage_tier) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [organizationId, name, type, size, asset.url, sha256Hash, nextVersion, asset.storage_tier]
      );

      res.status(200).json({
        success: true,
        deduplicated: true,
        message: 'File deduplicated successfully: matched existing content hash.',
        asset: newVersionRes.rows[0],
      });
      return;
    }

    // 2. Insert new cloud asset (No duplicate exists)
    const result = await query(
      'INSERT INTO cloud_assets (organization_id, name, type, size, url, sha256_hash, version, storage_tier) VALUES ($1, $2, $3, $4, $5, $6, 1, $7) RETURNING *',
      [organizationId, name, type, size, url, sha256Hash, 'hot']
    );

    res.status(201).json({
      success: true,
      deduplicated: false,
      asset: result.rows[0],
    });
  } catch (err) {
    handleError(err, res);
  }
});

// List organization cloud assets
router.get('/:organizationId', async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM cloud_assets WHERE organization_id = $1 ORDER BY "createdAt" DESC',
      [organizationId]
    );
    res.json({ success: true, assets: result.rows });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
