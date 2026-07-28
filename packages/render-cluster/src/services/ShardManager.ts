import { RenderShard } from '../types';

export class ShardManager {
  private shards: Map<string, RenderShard[]> = new Map();

  /**
   * Splits a massive render job into frame/chunk shards
   */
  public generateShards(
    jobId: string,
    startFrame: number,
    endFrame: number,
    shardsCount: number
  ): RenderShard[] {
    const totalFrames = endFrame - startFrame + 1;
    const chunkSize = Math.floor(totalFrames / shardsCount);
    const jobShards: RenderShard[] = [];

    for (let i = 0; i < shardsCount; i++) {
      const shardStart = startFrame + i * chunkSize;
      const shardEnd = i === shardsCount - 1 ? endFrame : shardStart + chunkSize - 1;

      jobShards.push({
        id: `shard_${jobId}_${i}`,
        jobId,
        startFrame: shardStart,
        endFrame: shardEnd,
        status: 'pending',
        progress: 0,
        retryCount: 0,
      });
    }

    this.shards.set(jobId, jobShards);
    return jobShards;
  }

  public getShardsForJob(jobId: string): RenderShard[] {
    return this.shards.get(jobId) || [];
  }

  public updateShardProgress(jobId: string, shardId: string, progress: number, checkpointFrame?: number): boolean {
    const jobShards = this.shards.get(jobId);
    if (!jobShards) return false;

    const shard = jobShards.find(s => s.id === shardId);
    if (!shard) return false;

    shard.progress = progress;
    if (checkpointFrame) shard.checkpointFrame = checkpointFrame;
    if (progress === 100) shard.status = 'completed';
    else if (shard.status === 'pending') shard.status = 'rendering';

    return true;
  }

  public markShardFailed(jobId: string, shardId: string, error: string): boolean {
    const jobShards = this.shards.get(jobId);
    if (!jobShards) return false;

    const shard = jobShards.find(s => s.id === shardId);
    if (!shard) return false;

    shard.status = 'failed';
    shard.error = error;
    shard.retryCount++;

    return true;
  }
}
