import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  PlaybackClockManager,
  BufferService,
  FrameEvaluator,
  SynchronizationService,
  PreviewFrame,
  FrameContext,
} from '../src/index';

describe('Playback Engine Core Unit Tests', () => {

  test('Playback Clock - play, pause, step and looping bounds', () => {
    // Clock for 100 frames total, 30 fps
    const clock = new PlaybackClockManager(100, 30, { loop: true });

    // Initial state stopped, frame 0
    assert.strictEqual(clock.getState(), 'stopped');
    assert.strictEqual(clock.getClock().currentFrame, 0);

    // Seek to frame 50
    clock.seek(50);
    assert.strictEqual(clock.getClock().currentFrame, 50);

    // Step frame by 5
    clock.stepFrame(5);
    assert.strictEqual(clock.getClock().currentFrame, 55);

    // Toggle loop setting off and step frame past boundaries
    clock.setSettings({ loop: false });
    clock.seek(98);

    // Step forward past boundary
    clock.stepFrame(5);
    assert.strictEqual(clock.getClock().currentFrame, 100);
  });

  test('BufferService - Look-Ahead caching, prefetching, and LRU eviction', () => {
    // Max cache size 5 frames
    const buffer = new BufferService(5);

    const mockFrame = (idx: number): PreviewFrame => ({
      frameIndex: idx,
      width: 1920,
      height: 1080,
      quality: 'high',
      renderData: {},
      timestamp: '',
    });

    // Prefetch ranges: current frame 10, total frames 100
    // Buffer defaults to 15 frames look-ahead
    const prefetch = buffer.getFramesToPrefetch(10, 100);
    assert.strictEqual(prefetch.length, 15);
    assert.strictEqual(prefetch[0], 11);
    assert.strictEqual(prefetch[14], 25);

    // Insert 5 frames into cache
    for (let i = 1; i <= 5; i++) {
      buffer.setFrame(i, mockFrame(i));
    }
    assert.strictEqual(buffer.getCacheSize(), 5);
    assert.ok(buffer.getFrame(1));

    // Insert 6th frame -> should evict furthest frame (frame index 1)
    buffer.setFrame(6, mockFrame(6));
    assert.strictEqual(buffer.getCacheSize(), 5);
    assert.strictEqual(buffer.getFrame(1), undefined); // evicted!
    assert.ok(buffer.getFrame(6));
  });

  test('Deterministic FrameEvaluator', () => {
    const context: FrameContext = {
      currentFrame: 45,
      totalFrames: 300,
      variables: {
        themeColor: '#ff0000',
        creator: 'Jules',
      },
      expressions: {
        layerX: 'frame * 2',
        layerY: 'time * 10',
      },
      timelineClips: [
        { id: 'c1', name: 'Intro', startFrame: 10, duration: 50, trackId: 'v1' }, // Intersects frame 45!
        { id: 'c2', name: 'Body', startFrame: 150, duration: 100, trackId: 'v1' }, // Does not intersect!
      ],
    };

    // Evaluate frame index 45
    const frame = FrameEvaluator.evaluateFrame(45, context, 'high');

    assert.strictEqual(frame.frameIndex, 45);
    assert.strictEqual(frame.quality, 'high');
    assert.strictEqual(frame.width, 1920);

    const data = frame.renderData;
    assert.strictEqual(data.resolvedVariables.creator, 'Jules');
    assert.strictEqual(data.resolvedExpressions.layerX, 90); // 45 * 2 mock evaluation

    // Check visible clips: c1 must be included, c2 must be filtered out
    assert.strictEqual(data.visibleClips.length, 1);
    assert.strictEqual(data.visibleClips[0].id, 'c1');
  });

  test('Audio Synchronization - track solos/mutes and peaks', () => {
    SynchronizationService.setLatencyOffset(50); // 50ms compensation
    assert.strictEqual(SynchronizationService.getSyncOffsetFrames(30), 2); // Math.round((50/1000) * 30) = 2 frames

    const tr1 = { id: 'track_video', isMuted: false, isSolo: false, type: 'video' };
    const tr2 = { id: 'track_audio', isMuted: true, isSolo: false, type: 'audio' };

    SynchronizationService.setTrackState('track_video', tr1);
    SynchronizationService.setTrackState('track_audio', tr2);

    // Video is audible (not muted)
    assert.strictEqual(SynchronizationService.isTrackAudible('track_video'), true);
    // Audio is muted -> not audible
    assert.strictEqual(SynchronizationService.isTrackAudible('track_audio'), false);

    // Solo rule override: solo Video
    SynchronizationService.setTrackState('track_video', { ...tr1, isSolo: true });
    SynchronizationService.setTrackState('track_audio', { ...tr2, isMuted: false }); // unmute audio but keep video solo

    // Video track is audible (it is soloed!)
    assert.strictEqual(SynchronizationService.isTrackAudible('track_video'), true);
    // Audio track is NOT soloed, so it is muted by solo rule
    assert.strictEqual(SynchronizationService.isTrackAudible('track_audio'), false);
  });
});
