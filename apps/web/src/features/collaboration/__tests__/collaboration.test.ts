import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { CommentService } from '../services/CommentService.ts';
import { AnnotationService } from '../services/AnnotationService.ts';
import { ReviewService } from '../services/ReviewService.ts';
import { MentionService } from '../services/MentionService.ts';
import { AttachmentService } from '../services/AttachmentService.ts';

describe('Collaboration & Review Foundation Tests', () => {
  const projectId = 'proj_test_456';
  const authorId = 'user_editor_1';
  const authorName = 'Alice (Editor)';

  test('CommentService & ReviewService - threads, replies, and status workflows', () => {
    // 1. Create a thread
    const thread = CommentService.createThread({
      projectId,
      targetType: 'clip',
      targetId: 'clip_intro_1',
      title: 'Intro clip sound level',
      authorId,
      authorName,
      content: 'The background music is slightly too loud here. Please reduce by 3dB.',
    });

    assert.ok(thread.id.startsWith('thread_'));
    assert.strictEqual(thread.projectId, projectId);
    assert.strictEqual(thread.targetType, 'clip');
    assert.strictEqual(thread.targetId, 'clip_intro_1');
    assert.strictEqual(thread.resolved, false);
    assert.strictEqual(thread.comments.length, 1);
    assert.strictEqual(
      thread.comments[0].content,
      'The background music is slightly too loud here. Please reduce by 3dB.',
    );

    // 2. Add a reply
    const reply = CommentService.addReply({
      thread,
      authorId: 'user_reviewer_1',
      authorName: 'Bob (Reviewer)',
      content: 'Agreed, let me adjust the audio track gain keyframes.',
    });

    assert.ok(reply.id.startsWith('comment_'));
    assert.strictEqual(thread.comments.length, 2);
    assert.strictEqual(
      thread.comments[1].content,
      'Agreed, let me adjust the audio track gain keyframes.',
    );

    // 3. Resolve the thread
    ReviewService.resolveThread(thread, 'Bob (Reviewer)');
    assert.strictEqual(thread.resolved, true);
    assert.strictEqual(thread.status, 'archived');
    assert.strictEqual(thread.resolvedBy, 'Bob (Reviewer)');

    // 4. Reopen the thread
    ReviewService.reopenThread(thread);
    assert.strictEqual(thread.resolved, false);
    assert.strictEqual(thread.status, 'needs_review');
    assert.strictEqual(thread.resolvedBy, undefined);
  });

  test('AnnotationService - markers and active ranges', () => {
    // 1. Single frame marker
    const marker = AnnotationService.createAnnotation({
      projectId,
      type: 'marker',
      timeStart: 120,
      label: 'Transition Point',
      color: '#ff0000',
      priority: 'high',
      authorId,
    });

    assert.ok(marker.id.startsWith('annot_'));
    assert.strictEqual(marker.type, 'marker');
    assert.strictEqual(marker.timeStart, 120);
    assert.strictEqual(marker.priority, 'high');

    // Test active frame matching with buffer range
    assert.strictEqual(AnnotationService.isActiveAtFrame(marker, 120), true);
    assert.strictEqual(AnnotationService.isActiveAtFrame(marker, 122), true); // within 5 frame buffer
    assert.strictEqual(AnnotationService.isActiveAtFrame(marker, 130), false); // outside buffer

    // 2. Region annotation
    const region = AnnotationService.createAnnotation({
      projectId,
      type: 'region',
      timeStart: 300,
      timeEnd: 450,
      label: 'Credits Section',
      priority: 'low',
      authorId,
    });

    assert.strictEqual(region.timeEnd, 450);
    assert.strictEqual(AnnotationService.isActiveAtFrame(region, 350), true); // inside range
    assert.strictEqual(AnnotationService.isActiveAtFrame(region, 290), false); // before range
    assert.strictEqual(AnnotationService.isActiveAtFrame(region, 460), false); // after range
  });

  test('MentionService - parses and highlights @mentions', () => {
    const text = 'Paging @jules to double check the audio track. @reviewer is looking at this.';

    // Parse mentions
    const parsed = MentionService.parseMentions(text);
    assert.deepStrictEqual(parsed.usernames, ['jules']);
    assert.deepStrictEqual(parsed.roles, ['reviewer']);

    // Highlight mentions
    const highlighted = MentionService.highlightMentions(text);
    assert.ok(highlighted.includes('class="mention"'));
    assert.ok(highlighted.includes('@jules'));
    assert.ok(highlighted.includes('@reviewer'));
  });

  test('AttachmentService - size boundaries validation', () => {
    // Valid small file
    const attachment = AttachmentService.createAttachment(
      'screenshot.png',
      'https://assets.com/screenshot.png',
      5 * 1024 * 1024,
    );
    assert.ok(attachment.id.startsWith('attach_'));
    assert.strictEqual(attachment.name, 'screenshot.png');

    // Invalid large file > 10MB
    assert.throws(() => {
      AttachmentService.createAttachment(
        'raw_video.mp4',
        'https://assets.com/video.mp4',
        15 * 1024 * 1024,
      );
    }, /File size exceeds the maximum limit of 10MB/);
  });
});
