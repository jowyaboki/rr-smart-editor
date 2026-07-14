import { Router } from 'express';
import { query } from '../db';
import { ProjectCreateSchema, ProjectUpdateSchema } from '@ai-video-editor/shared';
import { handleError, ApiError } from '../utils/errors';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM projects ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = ProjectCreateSchema.parse(req.body);
    const result = await query(
      'INSERT INTO projects (name, timeline) VALUES ($1, $2) RETURNING *',
      [validated.name, validated.timeline || '{"tracks": [], "playhead": 0, "zoom": 1}'],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectRes.rowCount === 0) throw new ApiError(404, 'Project not found');
    const project = projectRes.rows[0];

    const result = await query(
      'INSERT INTO projects (name, timeline) VALUES ($1, $2) RETURNING *',
      [`${project.name} (Copy)`, project.timeline],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(err, res);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const validated = ProjectUpdateSchema.parse(req.body);
    let result;
    if (validated.name && validated.timeline) {
      result = await query(
        'UPDATE projects SET name = $1, timeline = $2 WHERE id = $3 RETURNING *',
        [validated.name, validated.timeline, id],
      );
    } else if (validated.name) {
      result = await query('UPDATE projects SET name = $1 WHERE id = $2 RETURNING *', [
        validated.name,
        id,
      ]);
    } else if (validated.timeline) {
      result = await query('UPDATE projects SET timeline = $1 WHERE id = $2 RETURNING *', [
        validated.timeline,
        id,
      ]);
    } else {
      throw new ApiError(400, 'Name or timeline required');
    }

    if (result.rowCount === 0) throw new ApiError(404, 'Project not found');
    res.json(result.rows[0]);
  } catch (err) {
    handleError(err, res);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Project not found');
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
