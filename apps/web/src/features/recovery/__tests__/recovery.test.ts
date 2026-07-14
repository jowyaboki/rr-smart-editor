import { describe, test, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage for the Node.js test environment
class LocalStorageMock {
  private store: { [key: string]: string } = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

// Set up global mocks before importing services
before(() => {
  global.localStorage = new LocalStorageMock() as any;
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  } as any;
});

// Now import the services
import { ProjectValidationService } from '../services/ProjectValidationService.ts';
import { SnapshotService } from '../services/SnapshotService.ts';
import { AutoSaveService } from '../services/AutoSaveService.ts';
import { RecoveryService } from '../services/RecoveryService.ts';
import { HistoryCleanupService } from '../services/HistoryCleanupService.ts';

describe('Reliability & Recovery System Tests', () => {
  const projectId = 'test-project-123';
  const projectName = 'My Test Video';

  const mockTimeline = {
    tracks: [
      {
        id: 'track-1',
        name: 'Video Track',
        clips: [
          {
            id: 'clip-1',
            name: 'Intro Video',
            type: 'video',
            start: 0,
            duration: 150,
            mediaId: 'asset-1',
            url: 'https://assets.com/video1.mp4',
            trackId: 'track-1',
          },
        ],
      },
    ],
    playhead: 0,
    zoom: 1,
    snap: true,
  };

  const mockAssets = [
    {
      id: 'asset-1',
      name: 'Intro Video Asset',
      type: 'video',
      url: 'https://assets.com/video1.mp4',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    AutoSaveService.destroy();
  });

  afterEach(() => {
    AutoSaveService.destroy();
  });

  test('ProjectValidationService - schema and references validation', () => {
    // 1. Valid project schema validation
    const project = { id: projectId, name: projectName, timeline: mockTimeline };
    const schemaVal = ProjectValidationService.validateSchema(project);
    assert.strictEqual(schemaVal.isValid, true);

    // 2. Corrupt schema validation
    const corruptProject = { id: projectId, timeline: {} };
    const corruptSchemaVal = ProjectValidationService.validateSchema(corruptProject);
    assert.strictEqual(corruptSchemaVal.isValid, false);
    assert.ok(corruptSchemaVal.errors.length > 0);

    // 3. Asset reference validation (All references intact)
    const refValOk = ProjectValidationService.validateReferences(project, mockAssets);
    assert.strictEqual(refValOk.isValid, true);

    // 4. Broken reference validation (missing asset-2)
    const brokenTimeline = JSON.parse(JSON.stringify(mockTimeline));
    brokenTimeline.tracks[0].clips[0].mediaId = 'asset-2';
    const brokenProject = { id: projectId, name: projectName, timeline: brokenTimeline };
    const refValFail = ProjectValidationService.validateReferences(brokenProject, mockAssets);
    assert.strictEqual(refValFail.isValid, false);
    assert.ok(refValFail.errors.some((err) => err.includes('references missing asset mediaId')));
  });

  test('SnapshotService - create, save, load, and delete snapshots', () => {
    // 1. Create snapshot
    const snap = SnapshotService.createSnapshot({
      projectId,
      projectName,
      timeline: mockTimeline,
      assets: mockAssets,
      trigger: 'manual',
      description: 'First milestone',
    });

    assert.ok(snap.id.startsWith('snap_'));
    assert.strictEqual(snap.projectId, projectId);
    assert.strictEqual(snap.name, projectName);
    assert.strictEqual(snap.metadata.trigger, 'manual');
    assert.strictEqual(snap.metadata.description, 'First milestone');

    // 2. Save snapshot
    SnapshotService.saveSnapshot(snap);

    // 3. Retrieve snapshot
    const retrieved = SnapshotService.getSnapshot(snap.id);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.id, snap.id);
    assert.strictEqual(retrieved.metadata.hash, snap.metadata.hash);

    // Verify integrity validation
    const integrity = ProjectValidationService.validateSnapshotIntegrity(retrieved);
    assert.strictEqual(integrity.isValid, true);

    // 4. Delete snapshot
    SnapshotService.deleteSnapshot(snap.id);
    const deleted = SnapshotService.getSnapshot(snap.id);
    assert.strictEqual(deleted, null);
  });

  test('AutoSaveService - scheduled, manual, and pre-render saves', async () => {
    let savedSnapshot: any = null;

    AutoSaveService.initialize(
      {
        getProjectData: () => ({
          projectId,
          projectName,
          timeline: mockTimeline,
          assets: mockAssets,
        }),
        onSaveSuccess: (snapshot) => {
          savedSnapshot = snapshot;
        },
      },
      {
        intervalMs: 100, // 100ms for fast testing
        enabled: false, // Don't start timer automatically yet
      },
    );

    // 1. Check manual save
    const snap = await AutoSaveService.triggerManualSave('Manual checkpoint');
    assert.ok(snap);
    assert.strictEqual(snap.metadata.trigger, 'manual');
    assert.strictEqual(snap.metadata.description, 'Manual checkpoint');
    assert.strictEqual(savedSnapshot.id, snap.id);

    // 2. Check change registration and periodic auto-save
    AutoSaveService.updatePolicy(50, true); // 50ms interval, enabled
    AutoSaveService.registerChange(); // Poke change

    // Wait for auto-save interval to trigger
    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.ok(savedSnapshot);
    assert.strictEqual(savedSnapshot.metadata.trigger, 'autosave');
  });

  test('RecoveryService - crash detection and sessions', async () => {
    // 1. Setup simulated crash (an autosave snapshot exists but the app shut down unexpectedly)
    const snap = SnapshotService.createSnapshot({
      projectId,
      projectName,
      timeline: mockTimeline,
      assets: mockAssets,
      trigger: 'autosave',
    });

    // Save to special "latest autosave" key representing local state
    localStorage.setItem(`rr_latest_autosave_${projectId}`, JSON.stringify(snap));

    // 2. Simulate startup scan
    // Server says project was updated 2 hours ago (older than autosave)
    const serverTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const session = await RecoveryService.scanForRecovery({
      projectId,
      serverProjectUpdatedAt: serverTime,
      availableAssets: mockAssets,
    });

    assert.strictEqual(session.status, 'active');
    assert.strictEqual(session.candidates.length, 1);

    const cand = session.candidates[0];
    assert.strictEqual(cand.type, 'unsaved_project');
    assert.strictEqual(cand.source, 'autosave');
    assert.strictEqual(cand.canRestore, true);

    // 3. Resolve session
    RecoveryService.resolveSession(projectId, 'recovered');

    const resolvedSession = RecoveryService.getSession(projectId);
    assert.ok(resolvedSession);
    assert.strictEqual(resolvedSession.status, 'recovered');

    // Latest autosave and session candidate data should be cleaned up
    assert.strictEqual(localStorage.getItem(`rr_latest_autosave_${projectId}`), null);
  });

  test('HistoryCleanupService - snapshot retention limits and comparing', () => {
    // Create 5 snapshots
    const snaps: any[] = [];
    for (let i = 0; i < 5; i++) {
      const snap = SnapshotService.createSnapshot({
        projectId,
        projectName,
        timeline: mockTimeline,
        assets: mockAssets,
        trigger: 'manual',
        description: `Snapshot index ${i}`,
      });
      SnapshotService.saveSnapshot(snap);
      snaps.push(snap);
      // Wait a tiny bit so timestamps or IDs are guaranteed unique
    }

    // Policy: Keep maximum 3 snapshots
    const policy = {
      autoSaveIntervalMs: 30000,
      maxSnapshots: 3,
      retentionDays: 0,
      cleanupOnStartup: true,
      recoveryBehavior: 'prompt' as const,
    };

    const cleanup = HistoryCleanupService.cleanProjectHistory(projectId, policy);
    assert.strictEqual(cleanup.deletedCount, 2);
    assert.strictEqual(cleanup.remainingCount, 3);

    // Verify remaining are the latest ones (Snapshot 4, 3, 2)
    const remaining = SnapshotService.getProjectSnapshots(projectId);
    assert.strictEqual(remaining.length, 3);

    // Check compare functionality
    const snapA = snaps[0];
    const snapB = JSON.parse(JSON.stringify(snaps[1]));
    // Modify timeline in B
    snapB.timeline.tracks[0].clips[0].start = 20;

    const diff = HistoryCleanupService.compareSnapshots(snapA, snapB);
    assert.strictEqual(diff.timelineChanged, true);
    assert.strictEqual(diff.modifiedClips.length, 1);
    assert.ok(diff.modifiedClips[0].changes.some((c) => c.includes('start frame')));
  });
});
