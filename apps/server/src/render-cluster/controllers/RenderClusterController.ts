import { Request, Response } from 'express';
import { globalRenderClusterEngine } from '@ai-video-editor/render-cluster';

export class RenderClusterController {

  public async registerNode(req: Request, res: Response): Promise<void> {
    try {
      const node = req.body;
      if (!node.id || !node.name) {
        res.status(400).json({ success: false, error: 'Node id and name are required.' });
        return;
      }
      globalRenderClusterEngine.nodeRegistry.registerNode(node);
      res.json({ success: true, message: `Node '${node.name}' registered successfully.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async recordHeartbeat(req: Request, res: Response): Promise<void> {
    try {
      const hb = req.body;
      if (!hb.nodeId || !hb.timestamp) {
        res.status(400).json({ success: false, error: 'Heartbeat nodeId and timestamp are required.' });
        return;
      }
      const success = globalRenderClusterEngine.nodeRegistry.recordHeartbeat(hb);
      if (success) {
        res.json({ success: true, message: 'Heartbeat recorded.' });
      } else {
        res.status(404).json({ success: false, error: `Node '${hb.nodeId}' is not registered.` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async splitJobIntoShards(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, startFrame, endFrame, shardsCount } = req.body;
      if (!jobId || startFrame === undefined || endFrame === undefined) {
        res.status(400).json({ success: false, error: 'jobId, startFrame, and endFrame are required.' });
        return;
      }
      const shards = globalRenderClusterEngine.shardManager.generateShards(
        jobId,
        startFrame,
        endFrame,
        shardsCount || 4
      );
      res.json({ success: true, shards });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateShardProgress(req: Request, res: Response): Promise<void> {
    try {
      const { jobId, shardId, progress, checkpointFrame } = req.body;
      if (!jobId || !shardId || progress === undefined) {
        res.status(400).json({ success: false, error: 'jobId, shardId, and progress are required.' });
        return;
      }
      const success = globalRenderClusterEngine.shardManager.updateShardProgress(
        jobId,
        shardId,
        progress,
        checkpointFrame
      );
      if (success) {
        res.json({ success: true, message: 'Shard progress updated.' });
      } else {
        res.status(404).json({ success: false, error: `Shard '${shardId}' under job '${jobId}' not found.` });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getClusterMetrics(req: Request, res: Response): Promise<void> {
    try {
      const queueDepth = parseInt(req.query.queueDepth as string) || 0;
      const metrics = globalRenderClusterEngine.coordinator.getClusterMetrics(queueDepth);
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async evaluateAutoScaling(req: Request, res: Response): Promise<void> {
    try {
      const queueDepth = parseInt(req.body.queueDepth as string) || 0;
      const metrics = globalRenderClusterEngine.coordinator.getClusterMetrics(queueDepth);
      const scalingEvent = globalRenderClusterEngine.scalingService.evaluateScaling(metrics);
      res.json({ success: true, scalingEvent });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const renderClusterController = new RenderClusterController();
