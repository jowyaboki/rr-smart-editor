import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  CollaborationService,
  PresenceService,
  SynchronizationService,
  CommentService,
  PermissionService,
} from '../src/index';

describe('Real-Time Collaboration Engine Core Unit Tests', () => {

  test('Concurrent Operations Synchronization and Offline Replay Queues', () => {
    const sync = new SynchronizationService();

    // 1. Simulate standard online operation streaming
    const op1 = { id: 'op-1', timestamp: Date.now(), authorId: 'user-A', type: 'move_clip', path: 'timeline.clips[0].x', value: 150 };
    const res1 = sync.handleOperation(op1);
    assert.strictEqual(res1.status, 'broadcasted');
    assert.strictEqual(sync.getOperationsLog().length, 1);

    // 2. Simulate connectivity drop (Offline mode)
    sync.setConnectionState(false);
    const op2 = { id: 'op-2', timestamp: Date.now(), authorId: 'user-A', type: 'split_clip', path: 'timeline.clips[0]', value: { offset: 45 } };
    const res2 = sync.handleOperation(op2);
    assert.strictEqual(res2.status, 'queued'); // Buffers in offline queue
    assert.strictEqual(sync.getOfflineQueue().length, 1);
    assert.strictEqual(sync.getOperationsLog().length, 1); // Online log unchanged

    // 3. Reconnect and replay buffered queues
    const flushed = sync.setConnectionState(true);
    assert.strictEqual(flushed.length, 1);
    assert.strictEqual(flushed[0].id, 'op-2');
    assert.strictEqual(sync.getOfflineQueue().length, 0); // Flushed
    assert.strictEqual(sync.getOperationsLog().length, 2); // Replayed online
  });

  test('Soft Lock Protections and Lock Expirations', () => {
    const col = new CollaborationService();

    // User A acquires soft advisory lock on clip-1
    const lockA = col.acquireLock('clip-1', 'user-A', 'advisory', 30);
    assert.ok(lockA);
    assert.strictEqual(col.isLocked('clip-1'), true);

    // User B attempts to acquire same lock -> rejected
    const lockB = col.acquireLock('clip-1', 'user-B', 'advisory', 30);
    assert.strictEqual(lockB, null);

    // User A releases lock -> User B can now acquire lock
    col.releaseLock('clip-1', 'user-A');
    assert.strictEqual(col.isLocked('clip-1'), false);

    const lockB2 = col.acquireLock('clip-1', 'user-B', 'advisory', 30);
    assert.ok(lockB2);
    assert.strictEqual(col.isLocked('clip-1'), true);
  });

  test('Role-Based Capabilities Permissions Enforcement', () => {
    const perms = new PermissionService();

    // Editor has edit privileges, Viewer does not
    assert.strictEqual(perms.checkPermission('editor', 'editor'), true);
    assert.strictEqual(perms.checkPermission('viewer', 'editor'), false);

    // Reviewer has commenting access, Editor has both
    assert.strictEqual(perms.checkPermission('reviewer', 'reviewer'), true);
    assert.strictEqual(perms.checkPermission('editor', 'reviewer'), true);
  });

  test('Feedback Commenting, Frame Annotations, and Mentions Parsing', () => {
    const comments = new CommentService();

    // Create feedback comment with mentions
    const comment = comments.addComment('user-A', 'Jules', 'Hey @alex and @sarah, please review this transition.', { frame: 90 });
    assert.strictEqual(comment.authorName, 'Jules');
    assert.strictEqual(comment.frame, 90);

    // Mentions parsed correctly
    assert.deepStrictEqual(comment.mentions, ['alex', 'sarah']);

    // Check resolve toggle
    comments.resolveComment(comment.id);
    assert.strictEqual(comments.getComments()[0].resolved, true);
  });
});
