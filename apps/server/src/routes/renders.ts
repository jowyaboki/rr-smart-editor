import { Router } from 'express';
import { query } from '../db';
import { renderProject } from '../services/renderService';

const router = Router();

router.post('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectRes = await query('SELECT timeline FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rowCount === 0) return res.status(404).json({ error: 'Project not found' });

    const renderRes = await query(
      'INSERT INTO renders ("projectId") VALUES ($1) RETURNING *',
      [projectId]
    );
    const render = renderRes.rows[0];

    // Trigger render in background
    renderProject(projectId, render.id, projectRes.rows[0].timeline);

    res.status(202).json(render);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:renderId', async (req, res) => {
  const { renderId } = req.params;
  try {
    const result = await query('SELECT * FROM renders WHERE id = $1', [renderId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Render not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
