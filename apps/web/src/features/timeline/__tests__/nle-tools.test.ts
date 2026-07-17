import { describe, test } from 'node:test';
import assert from 'node:assert';

import { NleToolService } from '../tools/services/NleToolService';
import { NleSnappingService } from '../tools/snapping/NleSnappingService';
import { NleGroupingService } from '../tools/grouping/NleGroupingService';
import { NleShortcutService } from '../tools/shortcuts/NleShortcutService';
import { VirtualClip, TimelineMarker, VirtualKeyframe } from '../types';

describe('Professional NLE Upgraded Timeline Engine Unit Tests', () => {

  test('Razor Tool - Splitting a Clip', () => {
    const clip: VirtualClip = {
      id: 'clip_main',
      trackId: 'track_1',
      name: 'Main Video Clip',
      startFrame: 100,
      duration: 100, // end frame is 200
      type: 'video',
    };

    // Split at absolute timeline frame 140
    const { left, right } = NleToolService.splitClip(clip, 140);

    // Left clip starts at 100, duration 40 (ends at 140)
    assert.strictEqual(left.startFrame, 100);
    assert.strictEqual(left.duration, 40);

    // Right clip starts at 140, duration 60 (ends at 200)
    assert.strictEqual(right.startFrame, 140);
    assert.strictEqual(right.duration, 60);

    // Invalid split frames should throw
    assert.throws(() => {
      NleToolService.splitClip(clip, 90);
    }, /boundaries/);
  });

  test('Ripple Edit - Trimming and subsequent clips shifting', () => {
    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'tr1', name: 'Clip 1', startFrame: 0, duration: 100, type: 'v' },
      { id: 'c2', trackId: 'tr1', name: 'Clip 2', startFrame: 150, duration: 100, type: 'v' },
      { id: 'c3', trackId: 'tr1', name: 'Clip 3', startFrame: 300, duration: 50, type: 'v' },
    ];

    // Ripple Edit: Shrink c1 by 20 frames from the end
    const rippleEnd = NleToolService.applyRippleEdit('c1', -20, 'end', clips);

    // c1 duration should shrink to 80
    assert.strictEqual(rippleEnd.find(c => c.id === 'c1')?.duration, 80);
    // c2 and c3 should shift left by 20 frames
    assert.strictEqual(rippleEnd.find(c => c.id === 'c2')?.startFrame, 130);
    assert.strictEqual(rippleEnd.find(c => c.id === 'c3')?.startFrame, 280);

    // Ripple Edit: Extend c1 start (shifts left) by 10 frames from start
    const rippleStart = NleToolService.applyRippleEdit('c1', 10, 'start', clips);
    // c1 starts at 10, duration is 100 - 10 = 90
    assert.strictEqual(rippleStart.find(c => c.id === 'c1')?.startFrame, 10);
    assert.strictEqual(rippleStart.find(c => c.id === 'c1')?.duration, 90);
    // c2 and c3 should shift right by 10 frames
    assert.strictEqual(rippleStart.find(c => c.id === 'c2')?.startFrame, 160);
    assert.strictEqual(rippleStart.find(c => c.id === 'c3')?.startFrame, 310);
  });

  test('Roll Edit - Adjacent clips transition point adjustment', () => {
    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'tr1', name: 'Clip 1', startFrame: 0, duration: 100, type: 'v' },
      { id: 'c2', trackId: 'tr1', name: 'Clip 2', startFrame: 100, duration: 100, type: 'v' },
    ];

    // Roll transition point right by 15 frames
    const rolled = NleToolService.applyRollEdit('c1', 'c2', 15, clips);

    // Clip 1 duration increases to 115
    assert.strictEqual(rolled.find(c => c.id === 'c1')?.duration, 115);
    // Clip 2 start shifts to 115, duration shrinks to 85 (maintains overall end frame 200)
    assert.strictEqual(rolled.find(c => c.id === 'c2')?.startFrame, 115);
    assert.strictEqual(rolled.find(c => c.id === 'c2')?.duration, 85);
  });

  test('Slip and Slide Edits', () => {
    const clips: VirtualClip[] = [
      { id: 'c1', trackId: 'tr1', name: 'Preceding', startFrame: 0, duration: 100, type: 'v' },
      { id: 'c2', trackId: 'tr1', name: 'Target', startFrame: 100, duration: 100, type: 'v' },
      { id: 'c3', trackId: 'tr1', name: 'Succeeding', startFrame: 200, duration: 100, type: 'v' },
    ];

    // 1. Slip edit: Slide clip content startFrame in source by 30 frames
    const slipped = NleToolService.applySlipEdit('c2', 30, clips);
    assert.strictEqual(slipped.find(c => c.id === 'c2')?.metadata?.sourceStartFrame, 30);
    // Check that timeline coordinates are untouched!
    assert.strictEqual(slipped.find(c => c.id === 'c2')?.startFrame, 100);
    assert.strictEqual(slipped.find(c => c.id === 'c2')?.duration, 100);

    // 2. Slide edit: Moves Target c2 right by 20 frames
    // This should extend preceding c1, and shrink succeeding c3
    const slided = NleToolService.applySlideEdit('c2', 20, 'c1', 'c3', clips);
    assert.strictEqual(slided.find(c => c.id === 'c2')?.startFrame, 120);
    assert.strictEqual(slided.find(c => c.id === 'c1')?.duration, 120);
    assert.strictEqual(slided.find(c => c.id === 'c3')?.startFrame, 220);
    assert.strictEqual(slided.find(c => c.id === 'c3')?.duration, 80);
  });

  test('Grouped and Linked selections and moving together', () => {
    const clips: VirtualClip[] = [
      { id: 'video_1', trackId: 'v1', name: 'Video Component', startFrame: 50, duration: 100, type: 'v' },
      { id: 'audio_1', trackId: 'a1', name: 'Audio Component', startFrame: 50, duration: 100, type: 'a' },
      { id: 'independent', trackId: 'v1', name: 'Standalone', startFrame: 300, duration: 50, type: 'v' },
    ];

    NleGroupingService.clear();
    // Link video_1 to audio_1 (NLE sync linking)
    NleGroupingService.createLink('link_1', 'video_1', 'audio_1');

    const selection = NleGroupingService.expandSelection(['video_1']);
    assert.strictEqual(selection.length, 2);
    assert.ok(selection.includes('audio_1'));

    // Shift them together
    const shifted = NleGroupingService.shiftClipsTogether(['video_1'], 25, clips);
    assert.strictEqual(shifted.find(c => c.id === 'video_1')?.startFrame, 75);
    assert.strictEqual(shifted.find(c => c.id === 'audio_1')?.startFrame, 75);
    assert.strictEqual(shifted.find(c => c.id === 'independent')?.startFrame, 300); // untouched
  });

  test('J-K-L Playback Shuttle Short Shortcut keys', () => {
    NleShortcutService.setPlaybackSpeed(0);

    // Press L first time -> 1x forward
    let s = NleShortcutService.handleJkl('l');
    assert.strictEqual(s, 1);

    // Press L second time -> 2x forward shuttle
    s = NleShortcutService.handleJkl('l');
    assert.strictEqual(s, 2);

    // Press K -> stop
    s = NleShortcutService.handleJkl('k');
    assert.strictEqual(s, 0);

    // Press J first time -> -1x backward
    s = NleShortcutService.handleJkl('j');
    assert.strictEqual(s, -1);
  });
});
