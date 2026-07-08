import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /projects
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM projects ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /projects
router.post('/', async (req, res) => {
  const { name, timeline } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await query(
      'INSERT INTO projects (name, timeline) VALUES ($1, $2) RETURNING *',
      [name, timeline || '{"tracks": [], "playhead": 0, "zoom": 1}']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /projects/:id/duplicate
router.post('/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectRes.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    const project = projectRes.rows[0];

    const result = await query(
      'INSERT INTO projects (name, timeline) VALUES ($1, $2) RETURNING *',
      [`${project.name} (Copy)`, project.timeline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /projects/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, timeline } = req.body;
  try {
    let result;
    if (name && timeline) {
      result = await query(
        'UPDATE projects SET name = $1, timeline = $2 WHERE id = $3 RETURNING *',
        [name, timeline, id]
      );
    } else if (name) {
      result = await query('UPDATE projects SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    } else if (timeline) {
      result = await query('UPDATE projects SET timeline = $1 WHERE id = $2 RETURNING *', [timeline, id]);
    } else {
      return res.status(400).json({ error: 'Name or timeline required' });
    }

    if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /projects/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
