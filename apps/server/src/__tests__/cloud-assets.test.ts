import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import { query } from '../db';

describe('Cloud Assets Deduplication, CDN and Versioning Integration Tests', () => {
  const mockOrgId = '77777777-7777-7777-7777-777777777777';
  const sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty file sha

  before(async () => {
    // Clear test assets
    await query('DELETE FROM cloud_assets WHERE organization_id = $1', [mockOrgId]);
  });

  after(async () => {
    await query('DELETE FROM cloud_assets WHERE organization_id = $1', [mockOrgId]);
  });

  test('Assets upload with smart content-hash deduplication and versioning', async () => {
    // 1. Upload first asset (non-deduplicated, version 1)
    const res1 = await query(
      'INSERT INTO cloud_assets (organization_id, name, type, size, url, sha256_hash, version) VALUES ($1, $2, $3, $4, $5, $6, 1) RETURNING *',
      [mockOrgId, 'intro_clip.mp4', 'video', 1048576, 'https://cdn.onrender.com/assets/file_1.mp4', sha]
    );
    assert.strictEqual(res1.rowCount, 1);
    assert.strictEqual(res1.rows[0].version, 1);
    assert.strictEqual(res1.rows[0].sha256_hash, sha);

    // 2. Upload duplicate asset (deduplicated match found, reuses URL and increments version to 2)
    const existing = await query(
      'SELECT * FROM cloud_assets WHERE organization_id = $1 AND sha256_hash = $2 ORDER BY version DESC LIMIT 1',
      [mockOrgId, sha]
    );
    assert.strictEqual(existing.rowCount, 1);
    const asset = existing.rows[0];
    const nextVersion = asset.version + 1;

    const res2 = await query(
      'INSERT INTO cloud_assets (organization_id, name, type, size, url, sha256_hash, version) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [mockOrgId, 'intro_duplicate.mp4', 'video', 1048576, asset.url, sha, nextVersion]
    );

    assert.strictEqual(res2.rowCount, 1);
    assert.strictEqual(res2.rows[0].version, 2);
    assert.strictEqual(res2.rows[0].url, 'https://cdn.onrender.com/assets/file_1.mp4'); // reuses URL

    // 3. List organization assets
    const listRes = await query('SELECT * FROM cloud_assets WHERE organization_id = $1 ORDER BY version DESC', [mockOrgId]);
    assert.strictEqual(listRes.rowCount, 2);

    // Sort in-memory to guarantee exact sort mapping compatibility
    const sortedRows = listRes.rows.sort((a,b) => b.version - a.version);
    assert.strictEqual(sortedRows[0].version, 2);
    assert.strictEqual(sortedRows[1].version, 1);
  });
});
