import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let result;
    if (category) {
      result = await query(
        'SELECT * FROM templates WHERE category = $1 ORDER BY "createdAt" DESC',
        [category],
      );
    } else {
      result = await query('SELECT * FROM templates ORDER BY "createdAt" DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { name, category, timeline, projectId } = req.body;

  try {
    let finalTimeline = timeline;
    let finalName = name;

    if (projectId) {
      const projectRes = await query('SELECT name, timeline FROM projects WHERE id = $1', [
        projectId,
      ]);
      if (projectRes.rowCount && projectRes.rowCount > 0) {
        finalTimeline = projectRes.rows[0].timeline;
        finalName = finalName || projectRes.rows[0].name;
      }
    }

    if (!finalTimeline) return res.status(400).json({ error: 'Timeline required' });

    const result = await query(
      'INSERT INTO templates (name, category, timeline) VALUES ($1, $2, $3) RETURNING *',
      [finalName || 'Untitled Template', category || 'General', finalTimeline],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:templateId/use', async (req, res) => {
  const { templateId } = req.params;
  try {
    const templateRes = await query('SELECT * FROM templates WHERE id = $1', [templateId]);
    if (templateRes.rowCount === 0) return res.status(404).json({ error: 'Template not found' });
    const template = templateRes.rows[0];

    const result = await query(
      'INSERT INTO projects (name, timeline, "templateId") VALUES ($1, $2, $3) RETURNING *',
      [template.name, template.timeline, templateId],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
