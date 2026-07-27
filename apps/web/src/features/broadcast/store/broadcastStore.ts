import { create } from 'zustand';
import {
  BroadcastProject,
  LiveScene,
  SwitcherState,
  RecordingSession,
  StreamingDestination,
  PerformanceMetrics,
  Overlay,
  LiveTransition,
  ReplayClip,
  LiveProductionEngine,
} from '@ai-video-editor/broadcast-engine';

const engine = new LiveProductionEngine();

const sampleProject: BroadcastProject = {
  id: 'proj_web_broadcast_1',
  name: 'Global esports Championship Live',
  sceneCollections: [
    {
      id: 'coll_championship_1',
      name: 'Main Esports Production',
      scenes: [
        {
          id: 'scene_caster_cam',
          name: 'Main Caster desk (Cam 1)',
          inputs: [{ id: 'in_caster_fx6', name: 'Sony FX6 Caster Desk', type: 'camera', status: 'connected', volume: 1.0, isMuted: false, properties: {} }],
          overlays: [],
          audioMixPercent: 100,
        },
        {
          id: 'scene_game_feed',
          name: 'Spectator In-Game Feed',
          inputs: [{ id: 'in_game_pc', name: 'OBS Game Feed Capture', type: 'screen_capture', status: 'connected', volume: 0.9, isMuted: false, properties: {} }],
          overlays: [],
          audioMixPercent: 90,
        },
        {
          id: 'scene_analyst_desk',
          name: 'Post-Game Analyst Desk',
          inputs: [{ id: 'in_analyst_cam', name: 'Studio Analyst Desk Cam', type: 'camera', status: 'connected', volume: 1.0, isMuted: false, properties: {} }],
          overlays: [],
          audioMixPercent: 100,
        }
      ],
    }
  ],
  activeSceneCollectionId: 'coll_championship_1',
  streamingDestinations: [
    { id: 'dest_twitch', name: 'Twitch Esports Channel', protocol: 'rtmp', streamUrl: 'rtmp://live.twitch.tv/app', streamKey: 'live_esports_key', isEnabled: true, status: 'idle' },
    { id: 'dest_rtmp_facebook', name: 'Facebook Gaming Hub', protocol: 'rtmp', streamUrl: 'rtmp://live-api-s.facebook.com:80', streamKey: 'fb_key_stream_xx', isEnabled: false, status: 'idle' }
  ],
  recordingConfig: {
    id: 'web_rec_conf_1',
    type: 'program',
    format: 'mp4',
    bitrateKbps: 8000,
    autoRotate: false,
    rotationDurationMinutes: 15,
    outputDirectory: '/user/movies/broadcast_recordings',
  },
  replayConfig: {
    maxDurationSeconds: 45,
    resolution: { width: 1920, height: 1080 },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Instantiate the service using our live production engine
const liveSession = engine.createBroadcastSession(
  sampleProject,
  sampleProject.recordingConfig,
  sampleProject.replayConfig
);

interface BroadcastState {
  project: BroadcastProject;
  activeScenes: LiveScene[];
  switcherState: SwitcherState;
  recordingSession: RecordingSession | null;
  streamingDestinations: StreamingDestination[];
  performanceMetrics: PerformanceMetrics;
  overlays: Overlay[];
  savedReplays: ReplayClip[];
  isReplayBufferActive: boolean;

  // Actions
  initBroadcastStore: () => void;
  selectPreview: (sceneId: string) => void;
  cut: () => Promise<void>;
  fade: (durationMs?: number) => Promise<void>;
  wipe: (durationMs?: number) => Promise<void>;
  stinger: (stingerAssetId: string, durationMs?: number) => Promise<void>;
  startStreaming: (id: string) => Promise<void>;
  stopStreaming: (id: string) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startReplayBuffer: () => void;
  stopReplayBuffer: () => void;
  captureReplay: (durationSeconds: number, notes?: string) => void;
  triggerBreakingNews: (headline: string, details?: string) => void;
  triggerScoreboard: (homeTeam: string, awayTeam: string, homeScore: number, awayScore: number) => void;
  removeOverlay: (id: string) => void;
  toggleOverlayVisibility: (id: string) => void;
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
}

export const useBroadcastStore = create<BroadcastState>((set, get) => {
  return {
    project: sampleProject,
    activeScenes: sampleProject.sceneCollections[0].scenes,
    switcherState: liveSession.switcher.getSwitcherState(),
    recordingSession: null,
    streamingDestinations: sampleProject.streamingDestinations,
    performanceMetrics: {
      fps: 60,
      droppedFrames: 0,
      bitrateKbps: 0,
      latencyMs: 12,
      cpuPercent: 14,
      gpuPercent: 22,
      memoryMb: 840,
      networkUploadSpeedMbps: 45.2,
    },
    overlays: [],
    savedReplays: [],
    isReplayBufferActive: false,

    initBroadcastStore: () => {
      // Setup initial live overlays
      liveSession.overlays.triggerScoreboard('WARRIORS', 'CELTICS', 92, 88);
      liveSession.overlays.triggerBreakingNews('MATCH POINT OVERTIME', 'Tensions rise in the live arena');

      set({
        activeScenes: liveSession.getActiveScenes(),
        switcherState: liveSession.switcher.getSwitcherState(),
        streamingDestinations: liveSession.streaming.getDestinations(),
        overlays: liveSession.overlays.getOverlays(),
        savedReplays: liveSession.replay.getSavedClips(),
        isReplayBufferActive: liveSession.replay.getBufferStatus().status === 'active',
      });
    },

    selectPreview: (sceneId) => {
      liveSession.switcher.selectPreview(sceneId);
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
    },

    cut: async () => {
      await liveSession.switcher.cut();
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
    },

    fade: async (durationMs = 500) => {
      const fadePromise = liveSession.switcher.fade(durationMs);
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
      await fadePromise;
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
    },

    wipe: async (durationMs = 800) => {
      const wipePromise = liveSession.switcher.wipe(durationMs);
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
      await wipePromise;
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
    },

    stinger: async (stingerAssetId, durationMs = 1000) => {
      const stingerPromise = liveSession.switcher.stinger(stingerAssetId, durationMs);
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
      await stingerPromise;
      set({ switcherState: { ...liveSession.switcher.getSwitcherState() } });
    },

    startStreaming: async (id) => {
      await liveSession.streaming.startStreaming(id);
      set({ streamingDestinations: [...liveSession.streaming.getDestinations()] });
    },

    stopStreaming: async (id) => {
      await liveSession.streaming.stopStreaming(id);
      set({ streamingDestinations: [...liveSession.streaming.getDestinations()] });
    },

    startRecording: async () => {
      const session = await liveSession.recording.startRecording();
      set({ recordingSession: { ...session } });
    },

    stopRecording: async () => {
      const session = await liveSession.recording.stopRecording();
      set({ recordingSession: { ...session } });
    },

    startReplayBuffer: () => {
      liveSession.replay.startReplayBuffer();
      set({
        isReplayBufferActive: true,
      });
    },

    stopReplayBuffer: () => {
      liveSession.replay.stopReplayBuffer();
      set({
        isReplayBufferActive: false,
      });
    },

    captureReplay: (durationSeconds, notes) => {
      liveSession.replay.captureInstantReplay(durationSeconds, notes);
      set({ savedReplays: [...liveSession.replay.getSavedClips()] });
    },

    triggerBreakingNews: (headline, details) => {
      liveSession.overlays.triggerBreakingNews(headline, details);
      set({ overlays: [...liveSession.overlays.getOverlays()] });
    },

    triggerScoreboard: (homeTeam, awayTeam, homeScore, awayScore) => {
      liveSession.overlays.triggerScoreboard(homeTeam, awayTeam, homeScore, awayScore);
      set({ overlays: [...liveSession.overlays.getOverlays()] });
    },

    removeOverlay: (id) => {
      liveSession.overlays.removeOverlay(id);
      set({ overlays: [...liveSession.overlays.getOverlays()] });
    },

    toggleOverlayVisibility: (id) => {
      liveSession.overlays.toggleVisibility(id);
      set({ overlays: [...liveSession.overlays.getOverlays()] });
    },

    updateMetrics: (metrics) => {
      set(state => ({
        performanceMetrics: { ...state.performanceMetrics, ...metrics },
      }));
    },
  };
});
