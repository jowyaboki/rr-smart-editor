import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  TimelineIndexService,
  TimelineVirtualizer,
  CacheService,
  GeometryService,
  DirtyRegionRenderer,
  VirtualTrack,
  VirtualClip,
  TimelineMarker,
  VirtualKeyframe,
  TimelineViewport,
} from '../src/index';

describe('Virtual Timeline Engine Core Unit Tests', () => {

  test('Spatial Indexing - Adding and Querying clips at scale', () => {
    const index = new TimelineIndexService(100); // Bucket size: 100 frames

    const tracks: VirtualTrack[] = [
      { id: 'track_1', name: 'Video 1', type: 'video', height: 50, yOffset: 0 },
      { id: 'track_2', name: 'Audio 1', type: 'audio', height: 50, yOffset: 50 },
    ];

    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'track_1', name: 'Clip A', startFrame: 50, duration: 80, type: 'video' }, // Overlaps bucket 0 and 1
      { id: 'c2', trackId: 'track_1', name: 'Clip B', startFrame: 220, duration: 40, type: 'video' }, // Overlaps bucket 2
      { id: 'c3', trackId: 'track_2', name: 'Clip C', startFrame: 350, duration: 150, type: 'audio' }, // Overlaps bucket 3, 4, 5
    ];

    index.rebuildIndex(tracks, clips, [], []);

    // Query bucket range 0 to 150 (covers frame 0-150) -> should only return Clip A (c1)
    const queriedClips1 = index.queryClips(0, 150);
    assert.strictEqual(queriedClips1.length, 1);
    assert.strictEqual(queriedClips1[0].id, 'c1');

    // Query range 200 to 400 (covers frame 200-400) -> should return Clip B (c2) and Clip C (c3)
    const queriedClips2 = index.queryClips(200, 400);
    assert.strictEqual(queriedClips2.length, 2);
    assert.ok(queriedClips2.some(c => c.id === 'c2'));
    assert.ok(queriedClips2.some(c => c.id === 'c3'));
    assert.ok(!queriedClips2.some(c => c.id === 'c1')); // Clip A does not intersect!
  });

  test('Horizontal & Vertical Virtualization with Adaptive Overscan', () => {
    const index = new TimelineIndexService(100);
    const tracks: VirtualTrack[] = [
      { id: 'track_1', name: 'Track 1', type: 'video', height: 50, yOffset: 0 },
      { id: 'track_2', name: 'Track 2', type: 'video', height: 50, yOffset: 50 },
      { id: 'track_3', name: 'Track 3', type: 'audio', height: 50, yOffset: 100 },
      { id: 'track_4', name: 'Track 4', type: 'audio', height: 50, yOffset: 150 },
    ];

    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'track_1', name: 'Clip 1', startFrame: 0, duration: 100, type: 'video' },
      { id: 'c2', trackId: 'track_3', name: 'Clip 2', startFrame: 400, duration: 100, type: 'audio' },
    ];

    index.rebuildIndex(tracks, clips, [], []);

    // Viewport covers vertical scrollTop = 40 to 120 (covers track 1, 2, 3), scrollLeft = 0 to 200 (frames 0 to 400 at 0.5 pxPerFrame)
    const viewport: TimelineViewport = {
      scrollLeft: 0,
      scrollTop: 40,
      width: 200, // 200 pixels width / 0.5 zoom = 400 frames
      height: 80, // 80 pixels height
      pxPerFrame: 0.5,
    };

    // Calculate region with overscan of 50 frames and 0 vertical tracks
    const region = TimelineVirtualizer.calculateVisibleRegion(viewport, tracks, 50, 0);

    // Expected horizontal bounds: startFrame = 0 (Math.max(0, 0 - 50)), endFrame = 400 + 50 = 450
    assert.strictEqual(region.startFrame, 0);
    assert.strictEqual(region.endFrame, 450);

    // Expected vertical track indexes (track yOffsets: tr1=0..50, tr2=50..100, tr3=100..150)
    // Scroll vertical window: 40..120. Overlaps tr1, tr2, tr3 -> indices 0, 1, 2.
    assert.strictEqual(region.startTrackIdx, 0);
    assert.strictEqual(region.endTrackIdx, 2);

    // Cull visible clips
    const visibleClips = TimelineVirtualizer.cullClips(region, tracks, index);
    // Clip 1 is at startFrame 0 on track 1 (index 0) -> visible!
    // Clip 2 is at startFrame 400 on track 3 (index 2) -> visible!
    assert.strictEqual(visibleClips.length, 2);
    assert.ok(visibleClips.some(c => c.id === 'c1'));
    assert.ok(visibleClips.some(c => c.id === 'c2'));

    // Move scroll vertical window down out of track 1 & 2 range: scrollTop = 120 (overlaps only track 3 & 4 -> indices 2 & 3)
    const viewportDown: TimelineViewport = { ...viewport, scrollTop: 120 };
    const regionDown = TimelineVirtualizer.calculateVisibleRegion(viewportDown, tracks, 50, 0);
    assert.strictEqual(regionDown.startTrackIdx, 2);
    assert.strictEqual(regionDown.endTrackIdx, 3);

    const culledDown = TimelineVirtualizer.cullClips(regionDown, tracks, index);
    // Clip 1 is on track 1 (index 0), which is culled vertically! Should only return Clip 2.
    assert.strictEqual(culledDown.length, 1);
    assert.strictEqual(culledDown[0].id, 'c2');
  });

  test('CacheService & Geometry conversions', () => {
    const cache = new CacheService();
    cache.setMeasurement('clip_render_duration', 12);
    assert.strictEqual(cache.getMeasurement('clip_render_duration'), 12);

    const geom = { x: 10, y: 50, width: 200, height: 48 };
    cache.setGeometry('c1', geom);
    assert.deepStrictEqual(cache.getGeometry('c1'), geom);

    cache.clearAll();
    assert.strictEqual(cache.getGeometry('c1'), undefined);

    // Geometry conversions
    const px = GeometryService.frameToX(100, 1.5);
    assert.strictEqual(px, 150);

    const frame = GeometryService.xToFrame(150, 1.5);
    assert.strictEqual(frame, 100);
  });

  test('Snapping boundary calculations', () => {
    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'tr', name: 'A', startFrame: 100, duration: 50, type: 'v' }, // start=100, end=150
      { id: 'c2', trackId: 'tr', name: 'B', startFrame: 300, duration: 100, type: 'v' }, // start=300, end=400
    ];

    // Frame 103 is within snapping threshold (5 frames) of Clip 1 start (100)
    const snap1 = GeometryService.getSnapFrame(103, clips, 5);
    assert.strictEqual(snap1, 100);

    // Frame 148 is within snapping threshold of Clip 1 end (150)
    const snap2 = GeometryService.getSnapFrame(148, clips, 5);
    assert.strictEqual(snap2, 150);

    // Frame 120 is far from any edge -> no snap
    const snap3 = GeometryService.getSnapFrame(120, clips, 5);
    assert.strictEqual(snap3, 120);
  });
});
