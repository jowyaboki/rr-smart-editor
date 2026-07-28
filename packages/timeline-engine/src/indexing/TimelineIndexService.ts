import { VirtualClip, VirtualKeyframe, TimelineMarker, VirtualTrack } from '../types';

export class TimelineIndexService {
  private bucketSize: number; // Interval bucket size in frames (e.g., 500 frames)

  // Spatial Index Buckets mapping bucketIndex -> Set of Item IDs
  private clipBuckets: Record<number, Set<string>> = {};
  private keyframeBuckets: Record<number, Set<string>> = {};
  private markerBuckets: Record<number, Set<string>> = {};

  // Store items for O(1) lookup
  private clips: Record<string, VirtualClip> = {};
  private keyframes: Record<string, VirtualKeyframe> = {};
  private markers: Record<string, TimelineMarker> = {};
  private tracks: VirtualTrack[] = [];

  // Track selections and search results
  private selectedIds = new Set<string>();
  private searchResults = new Set<string>();

  constructor(bucketSize: number = 500) {
    this.bucketSize = bucketSize;
  }

  /**
   * Rebuild the entire index with new tracks, clips, markers, and keyframes.
   */
  public rebuildIndex(
    tracks: VirtualTrack[],
    clips: VirtualClip[],
    markers: TimelineMarker[],
    keyframes: VirtualKeyframe[]
  ): void {
    this.clear();
    this.tracks = [...tracks].sort((a, b) => a.yOffset - b.yOffset);

    for (const clip of clips) {
      this.indexClip(clip);
    }
    for (const marker of markers) {
      this.indexMarker(marker);
    }
    for (const kf of keyframes) {
      this.indexKeyframe(kf);
    }
  }

  /**
   * Clear all indexes.
   */
  public clear(): void {
    this.clipBuckets = {};
    this.keyframeBuckets = {};
    this.markerBuckets = {};
    this.clips = {};
    this.keyframes = {};
    this.markers = {};
    this.tracks = [];
    this.selectedIds.clear();
    this.searchResults.clear();
  }

  /**
   * Get track at a specific vertical pixel offset.
   */
  public getTrackAtY(y: number): VirtualTrack | undefined {
    let currentY = 0;
    for (const track of this.tracks) {
      if (y >= track.yOffset && y < track.yOffset + track.height) {
        return track;
      }
    }
    return undefined;
  }

  /**
   * Spatial Index a Clip.
   * Maps clip to all buckets it overlaps.
   */
  public indexClip(clip: VirtualClip): void {
    this.clips[clip.id] = clip;
    if (clip.isSelected) {
      this.selectedIds.add(clip.id);
    }

    const startBucket = Math.floor(clip.startFrame / this.bucketSize);
    const endBucket = Math.floor((clip.startFrame + clip.duration) / this.bucketSize);

    for (let b = startBucket; b <= endBucket; b++) {
      if (!this.clipBuckets[b]) {
        this.clipBuckets[b] = new Set();
      }
      this.clipBuckets[b].add(clip.id);
    }
  }

  /**
   * Remove a clip from index.
   */
  public deindexClip(clipId: string): void {
    const clip = this.clips[clipId];
    if (!clip) return;

    const startBucket = Math.floor(clip.startFrame / this.bucketSize);
    const endBucket = Math.floor((clip.startFrame + clip.duration) / this.bucketSize);

    for (let b = startBucket; b <= endBucket; b++) {
      if (this.clipBuckets[b]) {
        this.clipBuckets[b].delete(clipId);
      }
    }

    delete this.clips[clipId];
    this.selectedIds.delete(clipId);
    this.searchResults.delete(clipId);
  }

  /**
   * Index a Marker.
   */
  public indexMarker(marker: TimelineMarker): void {
    this.markers[marker.id] = marker;
    const bucket = Math.floor(marker.frame / this.bucketSize);
    if (!this.markerBuckets[bucket]) {
      this.markerBuckets[bucket] = new Set();
    }
    this.markerBuckets[bucket].add(marker.id);
  }

  /**
   * Deindex a Marker.
   */
  public deindexMarker(markerId: string): void {
    const marker = this.markers[markerId];
    if (!marker) return;
    const bucket = Math.floor(marker.frame / this.bucketSize);
    if (this.markerBuckets[bucket]) {
      this.markerBuckets[bucket].delete(markerId);
    }
    delete this.markers[markerId];
  }

  /**
   * Index a Keyframe.
   */
  public indexKeyframe(kf: VirtualKeyframe): void {
    this.keyframes[kf.id] = kf;
    const clip = this.clips[kf.clipId];
    const absoluteFrame = clip ? clip.startFrame + kf.frame : kf.frame;

    const bucket = Math.floor(absoluteFrame / this.bucketSize);
    if (!this.keyframeBuckets[bucket]) {
      this.keyframeBuckets[bucket] = new Set();
    }
    this.keyframeBuckets[bucket].add(kf.id);
  }

  /**
   * Deindex a Keyframe.
   */
  public deindexKeyframe(kfId: string): void {
    const kf = this.keyframes[kfId];
    if (!kf) return;
    const clip = this.clips[kf.clipId];
    const absoluteFrame = clip ? clip.startFrame + kf.frame : kf.frame;

    const bucket = Math.floor(absoluteFrame / this.bucketSize);
    if (this.keyframeBuckets[bucket]) {
      this.keyframeBuckets[bucket].delete(kfId);
    }
    delete this.keyframes[kfId];
  }

  /**
   * Set selections list.
   */
  public setSelections(clipIds: string[]): void {
    this.selectedIds.clear();
    for (const id of clipIds) {
      this.selectedIds.add(id);
      if (this.clips[id]) {
        this.clips[id].isSelected = true;
      }
    }
  }

  /**
   * Set search results list.
   */
  public setSearchResults(clipIds: string[]): void {
    this.searchResults.clear();
    for (const id of clipIds) {
      this.searchResults.add(id);
    }
  }

  /**
   * Retrieve all Clips intersecting the frame range `[startFrame, endFrame]` in O(1) bucket lookups.
   */
  public queryClips(startFrame: number, endFrame: number): VirtualClip[] {
    const resultClips = new Set<string>();
    const startBucket = Math.floor(Math.max(0, startFrame) / this.bucketSize);
    const endBucket = Math.floor(Math.max(0, endFrame) / this.bucketSize);

    for (let b = startBucket; b <= endBucket; b++) {
      const bucket = this.clipBuckets[b];
      if (bucket) {
        for (const id of bucket) {
          resultClips.add(id);
        }
      }
    }

    // Secondary fine filtering to ensure absolute intersection
    const list: VirtualClip[] = [];
    for (const id of resultClips) {
      const clip = this.clips[id];
      if (clip) {
        const clipEnd = clip.startFrame + clip.duration;
        if (clip.startFrame <= endFrame && clipEnd >= startFrame) {
          list.push(clip);
        }
      }
    }
    return list;
  }

  /**
   * Retrieve all Markers intersecting the frame range `[startFrame, endFrame]`.
   */
  public queryMarkers(startFrame: number, endFrame: number): TimelineMarker[] {
    const resultMarkers = new Set<string>();
    const startBucket = Math.floor(Math.max(0, startFrame) / this.bucketSize);
    const endBucket = Math.floor(Math.max(0, endFrame) / this.bucketSize);

    for (let b = startBucket; b <= endBucket; b++) {
      const bucket = this.markerBuckets[b];
      if (bucket) {
        for (const id of bucket) {
          resultMarkers.add(id);
        }
      }
    }

    const list: TimelineMarker[] = [];
    for (const id of resultMarkers) {
      const marker = this.markers[id];
      if (marker && marker.frame >= startFrame && marker.frame <= endFrame) {
        list.push(marker);
      }
    }
    return list;
  }

  /**
   * Retrieve all Keyframes intersecting the frame range `[startFrame, endFrame]`.
   */
  public queryKeyframes(startFrame: number, endFrame: number): VirtualKeyframe[] {
    const resultKf = new Set<string>();
    const startBucket = Math.floor(Math.max(0, startFrame) / this.bucketSize);
    const endBucket = Math.floor(Math.max(0, endFrame) / this.bucketSize);

    for (let b = startBucket; b <= endBucket; b++) {
      const bucket = this.keyframeBuckets[b];
      if (bucket) {
        for (const id of bucket) {
          resultKf.add(id);
        }
      }
    }

    const list: VirtualKeyframe[] = [];
    for (const id of resultKf) {
      const kf = this.keyframes[id];
      if (kf) {
        const clip = this.clips[kf.clipId];
        const absoluteFrame = clip ? clip.startFrame + kf.frame : kf.frame;
        if (absoluteFrame >= startFrame && absoluteFrame <= endFrame) {
          list.push(kf);
        }
      }
    }
    return list;
  }

  /**
   * Helper: Check if clip is selected.
   */
  public isClipSelected(clipId: string): boolean {
    return this.selectedIds.has(clipId);
  }

  /**
   * Helper: Check if clip is a search result.
   */
  public isClipSearchResult(clipId: string): boolean {
    return this.searchResults.has(clipId);
  }

  /**
   * Get all tracks.
   */
  public getTracks(): VirtualTrack[] {
    return this.tracks;
  }

  /**
   * Get a specific clip by ID.
   */
  public getClip(clipId: string): VirtualClip | undefined {
    return this.clips[clipId];
  }
}
