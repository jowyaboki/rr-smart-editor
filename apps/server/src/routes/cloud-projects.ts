import { Router, Request, Response } from 'express';
import { query } from '../db';
import { handleError, ApiError } from '../utils/errors';

const router = Router();

// Automatic synchronization & conflict resolution
router.post('/:projectId/sync', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const { timeline, clientVersion, authorId, changeSummary } = req.body;
    if (!timeline || clientVersion === undefined) {
      res.status(400).json({ success: false, error: 'timeline and clientVersion are required' });
      return;
    }

    // 1. Get current version number from project history
    const historyCheck = await query(
      'SELECT COALESCE(MAX(version_number), 0) as current_version FROM project_history WHERE project_id = $1',
      [projectId]
    );
    const currentVersion = historyCheck.rows[0].current_version;

    // 2. Conflict resolution check
    if (clientVersion < currentVersion) {
      // Conflict detected! Client is behind the latest server version
      const latestHistory = await query(
        'SELECT * FROM project_history WHERE project_id = $1 ORDER BY version_number DESC LIMIT 1',
        [projectId]
      );
      res.status(409).json({
        success: false,
        error: 'CONFLICT_DETECTED',
        message: 'Conflict detected: your local version is out of sync with the cloud version.',
        serverVersion: currentVersion,
        serverTimeline: latestHistory.rows[0]?.timeline || null,
      });
      return;
    }

    // 3. Update timeline in projects
    const updateRes = await query(
      'UPDATE projects SET timeline = $1 WHERE id = $2 RETURNING *',
      [typeof timeline === 'string' ? timeline : JSON.stringify(timeline), projectId]
    );

    if (updateRes.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // 4. Create new version entry in history
    const nextVersion = currentVersion + 1;
    await query(
      'INSERT INTO project_history (project_id, timeline, version_number, author_id, change_summary) VALUES ($1, $2, $3, $4, $5)',
      [
        projectId,
        typeof timeline === 'string' ? timeline : JSON.stringify(timeline),
        nextVersion,
        authorId || null,
        changeSummary || `Version ${nextVersion}`
      ]
    );

    res.json({
      success: true,
      version: nextVersion,
      project: updateRes.rows[0],
    });
  } catch (err) {
    handleError(err, res);
  }
});

// Get project version history
router.get('/:projectId/history', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM project_history WHERE project_id = $1 ORDER BY version_number DESC',
      [projectId]
    );
    res.json({ success: true, history: result.rows });
  } catch (err) {
    handleError(err, res);
  }
});

// Create project restore point
router.post('/:projectId/restore-points', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const { name, createdBy } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'name is required' });
      return;
    }

    // Fetch current project timeline
    const projectRes = await query('SELECT timeline FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const rpRes = await query(
      'INSERT INTO project_restore_points (project_id, timeline, name, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [projectId, projectRes.rows[0].timeline, name, createdBy || null]
    );

    res.status(201).json({ success: true, restorePoint: rpRes.rows[0] });
  } catch (err) {
    handleError(err, res);
  }
});

// Get project restore points
router.get('/:projectId/restore-points', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM project_restore_points WHERE project_id = $1 ORDER BY "createdAt" DESC',
      [projectId]
    );
    res.json({ success: true, restorePoints: result.rows });
  } catch (err) {
    handleError(err, res);
  }
});

// Restore project to a specific restore point or version
router.post('/:projectId/restore', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const { timeline } = req.body;
    if (!timeline) {
      res.status(400).json({ success: false, error: 'timeline payload is required to restore' });
      return;
    }

    const updateRes = await query(
      'UPDATE projects SET timeline = $1 WHERE id = $2 RETURNING *',
      [typeof timeline === 'string' ? timeline : JSON.stringify(timeline), projectId]
    );

    res.json({ success: true, project: updateRes.rows[0] });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
