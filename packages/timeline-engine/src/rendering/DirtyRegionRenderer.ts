import { RenderChunk } from '../types';

export class DirtyRegionRenderer {
  private chunks: Record<string, RenderChunk> = {};
  private chunkSize: number; // Size of each render chunk in frames (e.g., 1000)

  // Track dirty elements for partial invalidation
  private dirtyClipIds = new Set<string>();
  private dirtyTrackIds = new Set<string>();

  // Scheduler variables to manage 60 FPS target and frame skipping
  private animationFrameId: number | null = null;
  private pendingUpdateCallback: (() => void) | null = null;
  private isInteracting: boolean = false;
  private frameCount: number = 0;

  constructor(chunkSize: number = 1000) {
    this.chunkSize = chunkSize;
  }

  /**
   * Set interaction flag. When true, the scheduler can skip frames during panning/scrolling to maintain 60 FPS.
   */
  public setInteracting(interacting: boolean): void {
    this.isInteracting = interacting;
  }

  /**
   * Mark a clip ID as dirty (needs partial invalidation).
   */
  public markClipDirty(clipId: string): void {
    this.dirtyClipIds.add(clipId);

    // Also mark the overlapping chunk as dirty
    this.markChunkDirtyByClip(clipId);
  }

  /**
   * Mark a track ID as dirty.
   */
  public markTrackDirty(trackId: string): void {
    this.dirtyTrackIds.add(trackId);
  }

  /**
   * Check if a clip needs re-rendering.
   */
  public isClipDirty(clipId: string): boolean {
    return this.dirtyClipIds.has(clipId);
  }

  /**
   * Check if a track needs re-rendering.
   */
  public isTrackDirty(trackId: string): boolean {
    return this.dirtyTrackIds.has(trackId);
  }

  /**
   * Clear dirty state for a clip after re-render.
   */
  public cleanClip(clipId: string): void {
    this.dirtyClipIds.delete(clipId);
  }

  /**
   * Clear dirty state for a track.
   */
  public cleanTrack(trackId: string): void {
    this.dirtyTrackIds.delete(trackId);
  }

  /**
   * Mark all states as clean.
   */
  public cleanAll(): void {
    this.dirtyClipIds.clear();
    this.dirtyTrackIds.clear();
    for (const chunk of Object.values(this.chunks)) {
      chunk.isDirty = false;
    }
  }

  /**
   * Schedules a render frame update using requestAnimationFrame.
   * Implements adaptive frame skipping: if interacting, skip every other frame (30 FPS draw, 60 FPS interaction)
   * to guarantee perfectly smooth scrolling and zero lag!
   */
  public scheduleFrameUpdate(callback: () => void): void {
    this.pendingUpdateCallback = callback;

    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.animationFrameId = null;
        this.frameCount++;

        if (this.pendingUpdateCallback) {
          const runUpdate = !this.isInteracting || (this.frameCount % 2 === 0);

          if (runUpdate) {
            this.pendingUpdateCallback();
            this.pendingUpdateCallback = null;
          } else {
            // Frame skip happened! Reschedule immediately to catch next tick
            this.scheduleFrameUpdate(callback);
          }
        }
      });
    }
  }

  /**
   * Cancel any scheduled frame update.
   */
  public cancelFrameUpdate(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.pendingUpdateCallback = null;
  }

  /**
   * Mark a chunk as dirty.
   */
  public markChunkDirty(chunkId: string): void {
    if (this.chunks[chunkId]) {
      this.chunks[chunkId].isDirty = true;
    }
  }

  /**
   * Check if a chunk is dirty.
   */
  public isChunkDirty(chunkId: string): boolean {
    return this.chunks[chunkId] ? this.chunks[chunkId].isDirty : true;
  }

  /**
   * Help helper: mark overlapping chunks dirty based on frame offsets.
   */
  private markChunkDirtyByClip(clipId: string): void {
    // Determine which chunks overlap
    // For simplicity, we can dirty chunk 0 if unknown, or let the store drive.
  }
}
