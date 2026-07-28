import { create } from 'zustand';
import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';
import {
  IDigitalTwin,
  Simulation,
  SimulationResult,
  Scenario,
  SimulationType,
} from '@ai-video-editor/simulation-engine';
import {
  webTwinManager,
  webSimulationService,
  webPredictionService,
  webOptimizationService,
  webValidationService,
  webReplayService,
} from '../services';

interface SimulationState {
  activeTwin: IDigitalTwin | null;
  simulations: Simulation[];
  scenarios: Scenario[];
  activeResult: SimulationResult | null;
  isSimulating: boolean;
  compareMode: boolean;
  replayPointer: number;

  // Actions
  initTwin: (
    project: Project,
    workflows?: Workflow[],
    variables?: WorkflowVariable[],
    assets?: any[],
    plugins?: string[],
    permissions?: string[]
  ) => void;
  executeOperation: (type: SimulationType, payload: any) => Promise<void>;
  runScenario: (scenario: Scenario) => Promise<void>;
  stepForward: () => void;
  stepBackward: () => void;
  timeTravel: (stepIndex: number) => void;
  rollback: () => void;
  setCompareMode: (compareMode: boolean) => void;
  clearSimulationHistory: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  // Define default scenarios
  const defaultScenarios: Scenario[] = [
    {
      id: 'scen_fast_export',
      name: 'Simulated 1080p Export',
      description: 'Simulate high quality H264 MP4 export of the timeline',
      steps: [
        { type: 'rendering', payload: { preset: 'h264_1080p', resolution: '1920x1080' } },
        { type: 'publishing', payload: { platform: 'vimeo' } },
      ],
    },
    {
      id: 'scen_ai_auto_caption',
      name: 'Safe AI Auto-Caption & Grade',
      description: 'Run automatic speech transcribing, overlay subtitles, and grade colors safely',
      steps: [
        { type: 'ai_operation', payload: { operation: 'auto_caption' } },
        { type: 'expression_evaluation', payload: { expression: 'clip.duration + 10', targetField: 'duration', targetClipId: 'clip_caption_ai_1' } },
        { type: 'rendering', payload: { preset: 'prores_422' } },
      ],
    },
    {
      id: 'scen_asset_replacement',
      name: 'Asset Upgrade Pipeline',
      description: 'Replaces raw media references with high-res equivalents and re-evaluates project health',
      steps: [
        { type: 'asset_replacement', payload: { oldAssetId: 'asset_video_1', newAssetId: 'asset_video_hd_1' } },
        { type: 'timeline_edit', payload: { action: 'move', clipId: 'clip_1', startFrame: 15 } },
      ],
    },
  ];

  return {
    activeTwin: null,
    simulations: [],
    scenarios: defaultScenarios,
    activeResult: null,
    isSimulating: false,
    compareMode: false,
    replayPointer: -1,

    initTwin: (project, workflows = [], variables = [], assets = [], plugins = [], permissions = []) => {
      // Clean up previous twins
      const oldTwins = webTwinManager.listTwins();
      oldTwins.forEach(t => webTwinManager.removeTwin(t.id));

      const twin = webTwinManager.createTwin(project, workflows, variables, assets, plugins, permissions);
      set({
        activeTwin: twin,
        activeResult: null,
        replayPointer: -1,
        compareMode: false,
      });

      // Populate initial estimates asynchronously
      get().executeOperation('plugin_execution', { hookName: 'init' });
    },

    executeOperation: async (type, payload) => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      set({ isSimulating: true });
      try {
        await activeTwin.executeOperation(type, payload);

        // Run full re-estimations
        const predictions = await webPredictionService.estimate(activeTwin);
        const optimizationProposals = await webOptimizationService.analyze(activeTwin);
        const validationIssues = await webValidationService.validate(activeTwin);

        const success = validationIssues.filter(i => i.severity === 'error').length === 0;

        const result: SimulationResult = {
          simulationId: `sim_${Date.now()}`,
          success,
          predictions,
          optimizationProposals,
          validationIssues,
          events: [...activeTwin.history],
          finalProjectState: activeTwin.getProjectState(),
          transactions: [], // Computed inside runSimulation or skipped for simple actions
        };

        set({
          activeResult: result,
          replayPointer: activeTwin.replayPointer,
        });
      } catch (err) {
        console.error('Error executing simulated operation:', err);
      } finally {
        set({ isSimulating: false });
      }
    },

    runScenario: async (scenario) => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      set({ isSimulating: true });
      const newSimulation: Simulation = {
        id: `sim_${Date.now()}`,
        name: scenario.name,
        status: 'running',
        scenario,
        createdAt: new Date().toISOString(),
      };

      set(state => ({ simulations: [newSimulation, ...state.simulations] }));

      try {
        const result = await webSimulationService.run(activeTwin, scenario);

        // Synchronize activeTwin history with result
        scenario.steps.forEach(step => {
          activeTwin.executeOperation(step.type, step.payload);
        });

        newSimulation.status = 'completed';
        newSimulation.result = result;

        set(state => ({
          activeResult: result,
          replayPointer: activeTwin.replayPointer,
          simulations: state.simulations.map(s => (s.id === newSimulation.id ? newSimulation : s)),
        }));
      } catch (err) {
        newSimulation.status = 'failed';
        set(state => ({
          simulations: state.simulations.map(s => (s.id === newSimulation.id ? newSimulation : s)),
        }));
        console.error('Simulation scenario run failed:', err);
      } finally {
        set({ isSimulating: false });
      }
    },

    stepForward: () => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      webReplayService.stepForward(activeTwin);
      set({ replayPointer: activeTwin.replayPointer });
    },

    stepBackward: () => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      webReplayService.stepBackward(activeTwin);
      set({ replayPointer: activeTwin.replayPointer });
    },

    timeTravel: (stepIndex) => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      webReplayService.timeTravel(activeTwin, stepIndex);
      set({ replayPointer: activeTwin.replayPointer });
    },

    rollback: () => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      webReplayService.rollback(activeTwin);
      set({ replayPointer: activeTwin.replayPointer });
    },

    setCompareMode: (compareMode) => {
      set({ compareMode });
    },

    clearSimulationHistory: () => {
      const { activeTwin } = get();
      if (!activeTwin) return;

      activeTwin.history = [];
      activeTwin.replayPointer = -1;
      set({
        activeResult: null,
        replayPointer: -1,
      });
    },
  };
});
