import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TransactionEngine } from '../engine/TransactionEngine';
import { useTransactionStore } from '../store/transactionStore';
import { useTimelineStore } from '../../../store/useTimelineStore';
import { TransactionHistory } from '../history/TransactionHistory';
import { PluginTransactionService } from '../services/PluginTransactionService';
import { AITransactionService } from '../services/AITransactionService';

describe('Editor Transaction Engine Tests', () => {
  beforeEach(() => {
    useTransactionStore.getState().clearHistory();
    useTransactionStore.getState().setActiveTransaction(null);
    useTransactionStore.getState().setActiveBatch(null);

    useTimelineStore.setState({
      tracks: [
        { id: 'v1', name: 'Video 1', type: 'video', clips: [] },
        { id: 'v2', name: 'Video 2', type: 'video', clips: [] },
        { id: 'a1', name: 'Audio 1', type: 'audio', clips: [] },
      ],
      playhead: 0,
      zoom: 1,
      snap: true,
      isPlaying: false,
      playbackRate: 1,
      isLooping: false,
    });
  });

  test('Single Transaction - successful execution and commit to history', async () => {
    TransactionEngine.begin('Add Clip v1');

    useTimelineStore.getState().addClip('v1', {
      name: 'Test Clip',
      type: 'video',
      start: 10,
      duration: 50,
    });

    const clips = useTimelineStore.getState().tracks[0].clips;
    assert.strictEqual(clips.length, 1);
    assert.strictEqual(clips[0].name, 'Test Clip');

    const res = await TransactionEngine.commit();
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'committed');

    const undoStack = useTransactionStore.getState().undoStack;
    assert.strictEqual(undoStack.length, 1);
    assert.strictEqual(undoStack[0].name, 'Add Clip v1');
  });

  test('Transaction Rollback - rolls back on execution error', async () => {
    TransactionEngine.begin('Add Faulty Clip');

    useTimelineStore.getState().addClip('v1', {
      name: 'Pre-fail Clip',
      type: 'video',
      start: 20,
      duration: 30,
    });

    const active = useTransactionStore.getState().activeTransaction;
    assert.ok(active);
    active.operations.push({
      id: 'faulty-op',
      type: 'custom',
      execute: () => {
        throw new Error('Simulation failed!');
      },
    });

    const res = await TransactionEngine.commit();
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 'failed');

    const clips = useTimelineStore.getState().tracks[0].clips;
    assert.strictEqual(clips.length, 0);

    const undoStack = useTransactionStore.getState().undoStack;
    assert.strictEqual(undoStack.length, 0);
  });

  test('Nested Transactions - child merges into parent on success', async () => {
    TransactionEngine.begin('Parent Action');

    useTimelineStore.getState().addClip('v1', {
      name: 'Parent Clip',
      type: 'video',
      start: 0,
      duration: 20,
    });

    TransactionEngine.begin('Nested Child Action');

    useTimelineStore.getState().addClip('v2', {
      name: 'Child Clip',
      type: 'video',
      start: 20,
      duration: 20,
    });

    const childRes = await TransactionEngine.commit();
    assert.strictEqual(childRes.success, true);

    const active = useTransactionStore.getState().activeTransaction;
    assert.ok(active);
    assert.strictEqual(active.name, 'Parent Action');

    const parentRes = await TransactionEngine.commit();
    assert.strictEqual(parentRes.success, true);

    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 1);
    assert.strictEqual(useTimelineStore.getState().tracks[1].clips.length, 1);

    assert.strictEqual(useTransactionStore.getState().undoStack.length, 1);
  });

  test('Transaction Batching - atomic batch execution and rollback on failure', async () => {
    const res = await TransactionEngine.batch('My Large Edit Batch', async () => {
      TransactionEngine.begin('Step 1');
      useTimelineStore.getState().addClip('v1', { name: 'Batch 1', type: 'video', start: 0, duration: 10 });
      await TransactionEngine.commit();

      TransactionEngine.begin('Step 2');
      useTimelineStore.getState().addClip('v2', { name: 'Batch 2', type: 'video', start: 10, duration: 10 });
      throw new Error('Batch simulation interrupted!');
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 'failed');

    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 0);
    assert.strictEqual(useTimelineStore.getState().tracks[1].clips.length, 0);
  });

  test('Unified Undo/Redo - undo and redo work correctly', async () => {
    useTimelineStore.getState().addClip('v1', {
      name: 'Auto Tx Clip',
      type: 'video',
      start: 5,
      duration: 15,
    });

    // Wait for the asynchronous auto-wrapped transaction to commit
    await new Promise((r) => setTimeout(r, 20));

    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 1);
    assert.strictEqual(useTransactionStore.getState().undoStack.length, 1);

    await TransactionHistory.undo();
    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 0);
    assert.strictEqual(useTransactionStore.getState().undoStack.length, 0);
    assert.strictEqual(useTransactionStore.getState().redoStack.length, 1);

    await TransactionHistory.redo();
    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 1);
    assert.strictEqual(useTransactionStore.getState().undoStack.length, 1);
    assert.strictEqual(useTransactionStore.getState().redoStack.length, 0);
  });

  test('Plugin Transactions - observe, register handlers, custom validation', async () => {
    let startedTriggered = false;
    let committedTriggered = false;

    PluginTransactionService.observe('started', () => { startedTriggered = true; });
    PluginTransactionService.observe('committed', () => { committedTriggered = true; });

    PluginTransactionService.addValidator('plugin_op', (params) => {
      if (params.value < 0) return 'Value cannot be negative';
      return true;
    });

    let customVal = 0;
    PluginTransactionService.registerHandler(
      'plugin_op',
      (params) => { customVal = params.value; },
      (params) => { customVal = 0; }
    );

    const tx = PluginTransactionService.createTransaction('Run Plugin Action');
    tx.operations.push({
      id: 'op1',
      type: 'plugin_op',
      params: { value: 42 },
      execute: () => {},
    });

    const res1 = await TransactionEngine.commit();
    assert.strictEqual(res1.success, true);
    assert.strictEqual(customVal, 42);
    assert.strictEqual(startedTriggered, true);
    assert.strictEqual(committedTriggered, true);

    const tx2 = PluginTransactionService.createTransaction('Run Faulty Plugin Action');
    tx2.operations.push({
      id: 'op2',
      type: 'plugin_op',
      params: { value: -10 },
      execute: () => {},
    });

    const res2 = await TransactionEngine.commit();
    assert.strictEqual(res2.success, false);
    assert.ok(res2.error?.includes('Value cannot be negative'));
  });

  test('AI Transactions - execute as transaction batches', async () => {
    const res = await AITransactionService.executeAIBatch('AI Creative Agent Edit', [
      {
        name: 'AI Add Text',
        execute: () => {
          useTimelineStore.getState().addClip('v1', { name: 'AI Clip 1', type: 'text', start: 0, duration: 15 });
        },
      },
      {
        name: 'AI Add Music',
        execute: () => {
          useTimelineStore.getState().addClip('a1', { name: 'AI Music 1', type: 'audio', start: 0, duration: 100 });
        },
      },
    ]);

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'committed');

    assert.strictEqual(useTimelineStore.getState().tracks[0].clips.length, 1);
    assert.strictEqual(useTimelineStore.getState().tracks[2].clips.length, 1);

    const undoStack = useTransactionStore.getState().undoStack;
    assert.strictEqual(undoStack.length, 1);
    assert.strictEqual(undoStack[0].name, 'AI Creative Agent Edit');
  });
});
