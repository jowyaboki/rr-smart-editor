import {
  LiveProductionEngine,
  BroadcastProject,
  RecordingConfig,
  ReplayConfig,
  LiveScene,
} from '../src';

describe('Broadcast Studio & Live Production Engine Tests', () => {
  let engine: LiveProductionEngine;
  let sampleProject: BroadcastProject;
  let recordingConfig: RecordingConfig;
  let replayConfig: ReplayConfig;

  beforeEach(() => {
    engine = new LiveProductionEngine();

    const scene1: LiveScene = {
      id: 'scene_cam_1',
      name: 'Main Studio Camera',
      inputs: [
        {
          id: 'input_cam_1',
          name: 'Sony FX3 Feed',
          type: 'camera',
          status: 'connected',
          volume: 1.0,
          isMuted: false,
          properties: {},
        },
      ],
      overlays: [],
      audioMixPercent: 100,
    };

    const scene2: LiveScene = {
      id: 'scene_screen_share',
      name: 'Screen Share + Presenter PIP',
      inputs: [
        {
          id: 'input_screen_1',
          name: 'Desktop Capture',
          type: 'screen_capture',
          status: 'connected',
          volume: 0.8,
          isMuted: false,
          properties: {},
        },
        {
          id: 'input_cam_1_pip',
          name: 'Sony FX3 PIP',
          type: 'camera',
          status: 'connected',
          volume: 0.2,
          isMuted: true,
          properties: {},
        },
      ],
      overlays: [],
      audioMixPercent: 80,
    };

    sampleProject = {
      id: 'proj_broadcast_1',
      name: 'Live Tech Keynote Broadcast',
      sceneCollections: [
        {
          id: 'coll_tech_1',
          name: 'Tech Show Setup',
          scenes: [scene1, scene2],
        },
      ],
      activeSceneCollectionId: 'coll_tech_1',
      streamingDestinations: [
        {
          id: 'dest_rtmp_youtube',
          name: 'YouTube Live Studio',
          protocol: 'rtmp',
          streamUrl: 'rtmp://a.rtmp.youtube.com/live2',
          streamKey: 'xxxx-yyyy',
          isEnabled: true,
          status: 'idle',
        },
        {
          id: 'dest_srt_twitch',
          name: 'Twitch TV',
          protocol: 'srt',
          streamUrl: 'srt://live.twitch.tv:443',
          isEnabled: false,
          status: 'idle',
        },
      ],
      recordingConfig: {
        id: 'rec_conf_1',
        type: 'program',
        format: 'mp4',
        bitrateKbps: 6000,
        autoRotate: true,
        rotationDurationMinutes: 10,
        outputDirectory: '/var/recordings',
      },
      replayConfig: {
        maxDurationSeconds: 30,
        resolution: { width: 1920, height: 1080 },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recordingConfig = sampleProject.recordingConfig;
    replayConfig = sampleProject.replayConfig;
  });

  test('Should initialize broadcast studio with active scene collection', () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);
    expect(session).toBeDefined();
    expect(session.getActiveScenes().length).toBe(2);
    expect(session.switcher.getSwitcherState().programSceneId).toBe('scene_cam_1');
  });

  test('Should switch preview and program scene with Cut and Fade transitions', async () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);

    // Select preview scene
    session.switcher.selectPreview('scene_screen_share');
    expect(session.switcher.getSwitcherState().previewSceneId).toBe('scene_screen_share');

    // Trigger instant CUT
    await session.switcher.cut();
    expect(session.switcher.getSwitcherState().programSceneId).toBe('scene_screen_share');

    // Switch back with a FADE transition
    session.switcher.selectPreview('scene_cam_1');
    const fadePromise = session.switcher.fade(100);
    expect(session.switcher.getSwitcherState().isTransitioning).toBe(true);

    await fadePromise;
    expect(session.switcher.getSwitcherState().isTransitioning).toBe(false);
    expect(session.switcher.getSwitcherState().programSceneId).toBe('scene_cam_1');
  });

  test('Should handle RTMP/SRT streaming destination connections', async () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);

    // Check initial streaming destination setup
    const destinations = session.streaming.getDestinations();
    expect(destinations.length).toBe(2);

    // Start streaming to Youtube
    await session.streaming.startStreaming('dest_rtmp_youtube');
    expect(destinations[0].status).toBe('streaming');

    // Stop streaming
    await session.streaming.stopStreaming('dest_rtmp_youtube');
    expect(destinations[0].status).toBe('idle');
  });

  test('Should support program recording with automatic file rotation', async () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);

    // Modify config to rotate extremely fast for test simulation (0.01 minutes = 600ms)
    session.recording.updateConfig({
      autoRotate: true,
      rotationDurationMinutes: 0.01,
    });

    const recordingSession = await session.recording.startRecording();
    expect(recordingSession.status).toBe('recording');
    expect(recordingSession.activeFilePath).toContain('stream_program_');

    // Simulate wait for rotation to fire
    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(recordingSession.rotatedFilePaths.length).toBeGreaterThanOrEqual(1);
    expect(recordingSession.activeFilePath).toContain('stream_program_rotated_');

    await session.recording.stopRecording();
    expect(recordingSession.status).toBe('idle');
  });

  test('Should capture instant slow-motion replay clips from buffer', () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);

    // Start buffer
    session.replay.startReplayBuffer();
    expect(session.replay.getBufferStatus().status).toBe('active');

    // Capture clip
    const clip = session.replay.captureInstantReplay(5, 'Epic Goal scored!');
    expect(clip.durationMs).toBe(5000);
    expect(clip.playbackSpeed).toBe(0.5); // 50% slow-mo
    expect(clip.markerNotes).toBe('Epic Goal scored!');

    // Check saved clips
    expect(session.replay.getSavedClips().length).toBe(1);

    session.replay.stopReplayBuffer();
    expect(session.replay.getBufferStatus().status).toBe('idle');
  });

  test('Should manage live breaking news and scoreboard overlays', () => {
    const session = engine.createBroadcastSession(sampleProject, recordingConfig, replayConfig);

    // Trigger live scoreboard
    const scoreOverlay = session.overlays.triggerScoreboard('USA', 'CAN', 2, 1);
    expect(scoreOverlay.type).toBe('scoreboard');
    expect(scoreOverlay.properties.homeScore).toBe(2);
    expect(session.overlays.getOverlays().length).toBe(1);

    // Trigger live breaking news banner
    const breakingNews = session.overlays.triggerBreakingNews('MARKET HIGHS AT BELL');
    expect(breakingNews.type).toBe('breaking_news');
    expect(breakingNews.properties.headline).toBe('MARKET HIGHS AT BELL');
    expect(session.overlays.getOverlays().length).toBe(2);

    // Toggle visibility of breaking news
    session.overlays.toggleVisibility(breakingNews.id);
    expect(breakingNews.isVisible).toBe(false);

    // Remove scoreboard
    session.overlays.removeOverlay(scoreOverlay.id);
    expect(session.overlays.getOverlays().length).toBe(1);
  });
});
