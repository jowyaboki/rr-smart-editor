import { Router } from 'express';
import { query } from '../db';
import { queueService } from '../render/queue/QueueService';
import { workerService } from '../render/workers/WorkerService';
import { artifactService } from '../render/services/ArtifactService';
import { metricsService } from '../render/services/MetricsService';
import { z } from 'zod';
import { handleError } from '../utils/errors';

const router = Router();

const CreateJobSchema = z.object({
  projectId: z.string(),
  timeline: z.any().optional().default({ tracks: [], playhead: 0, zoom: 1 }),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  presetId: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  settings: z
    .object({
      format: z.string().optional(),
      codec: z.string().optional(),
      resolution: z.object({ width: z.number(), height: z.number() }).optional(),
      fps: z.number().optional(),
      range: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
});

router.post('/queue', async (req, res) => {
  try {
    const data = CreateJobSchema.parse(req.body);
    const job = await queueService.createJob(data);
    res.status(201).json(job);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/queue/pause', async (req, res) => {
  try {
    await queueService.pauseQueue();
    res.json({ status: 'paused' });
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/queue/resume', async (req, res) => {
  try {
    await queueService.resumeQueue();
    res.json({ status: 'running' });
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/queue/status', async (req, res) => {
  try {
    const status = await queueService.getQueueStatus();
    res.json({ status });
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = {
      projectId: typeof projectId === 'string' ? projectId : undefined,
      status: typeof status === 'string' ? status : undefined,
    };
    const jobs = await queueService.listJobs(filter);
    res.json(jobs);
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await queueService.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job ${jobId} not found` });
    }
    res.json(job);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const success = await queueService.cancelJob(jobId);
    if (!success) {
      return res.status(400).json({ error: `Job ${jobId} could not be cancelled` });
    }
    res.json({ success: true, message: `Job ${jobId} cancelled successfully` });
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/jobs/:jobId/retry', async (req, res) => {
  try {
    const { jobId } = req.params;
    const success = await queueService.retryJob(jobId);
    if (!success) {
      return res.status(400).json({ error: `Job ${jobId} could not be retried` });
    }
    res.json({ success: true, message: `Job ${jobId} re-enqueued successfully` });
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/workers', async (req, res) => {
  try {
    const workers = await workerService.listWorkers();
    res.json(workers);
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/artifacts', async (req, res) => {
  try {
    const artifacts = await artifactService.listArtifacts();
    res.json(artifacts);
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getQueueMetrics();
    res.json(metrics);
  } catch (err) {
    handleError(err, res);
  }
});

// Backward compatibility endpoints
router.post('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    let timeline = { tracks: [], playhead: 0, zoom: 1 };
    try {
      const projectRes = await query('SELECT timeline FROM projects WHERE id = $1', [projectId]);
      if (projectRes && (projectRes.rowCount || 0) > 0) {
        timeline = projectRes.rows[0].timeline;
      }
    } catch {}

    const job = await queueService.createJob({
      projectId,
      timeline,
      priority: 'normal',
    });

    res.status(202).json({
      id: job.id,
      projectId: job.projectId,
      status: job.status,
      progress: job.progress,
      outputUrl: null,
      error: null,
    });
  } catch (err) {
    handleError(err, res);
  }
});

router.get('/:renderId', async (req, res) => {
  const { renderId } = req.params;
  try {
    const job = await queueService.getJob(renderId);
    if (job) {
      return res.json({
        id: job.id,
        projectId: job.projectId,
        status: job.status,
        progress: job.progress,
        outputUrl: job.artifacts?.[0]?.url || null,
        error: job.error || null,
      });
    }

    try {
      const result = await query('SELECT * FROM renders WHERE id = $1', [renderId]);
      if (result && (result.rowCount || 0) > 0) {
        return res.json(result.rows[0]);
      }
    } catch {}

    res.status(404).json({ error: 'Render/Job not found' });
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
