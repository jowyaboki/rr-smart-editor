import { IDigitalTwin, OptimizationProposal, OptimizationStrategy } from '../types';

export class OptimizationService {
  private strategies: OptimizationStrategy[] = [];

  public registerStrategy(strategy: OptimizationStrategy): void {
    this.strategies.push(strategy);
  }

  public async analyze(twin: IDigitalTwin): Promise<OptimizationProposal[]> {
    const proposals: OptimizationProposal[] = [];
    const timeline = twin.getProjectState().timeline || { clips: [], tracks: [] };
    const clips = timeline.clips || [];
    const tracks = timeline.tracks || [];
    const workflows = twin.getWorkflows();

    // Strategy 1: Check for merging layers
    const overlappingTracks = tracks.length > 5;
    if (overlappingTracks) {
      proposals.push({
        id: 'opt_merge_layers',
        category: 'merge_layers',
        title: 'Consolidate redundant tracks',
        description: 'You have more than 5 parallel tracks. Merging inactive tracks or overlapping static items can reduce CPU/GPU workload.',
        potentialSavings: {
          costReduction: 0.05,
          renderDurationReductionMs: 1200,
          memoryReductionMb: 45,
        },
        effort: 'medium',
      });
    }

    // Strategy 2: Check for unoptimized assets (e.g., 4K elements on HD/SD timelines)
    const largeAssets = clips.some((c: any) => c.resolution === '4K' || c.sizeMb > 500);
    if (largeAssets) {
      proposals.push({
        id: 'opt_optimize_assets',
        category: 'optimize_assets',
        title: 'Convert 4K sources to Smart Proxies',
        description: 'Large raw 4K source assets detected. Down-sampling to 1080p proxies will improve timeline scrolling and scrubbing speed.',
        potentialSavings: {
          costReduction: 0,
          renderDurationReductionMs: 3500,
          memoryReductionMb: 128,
        },
        effort: 'low',
      });
    }

    // Strategy 3: Reduce heavy video effects
    const heavyEffects = clips.some((c: any) => c.effects && c.effects.length > 3);
    if (heavyEffects) {
      proposals.push({
        id: 'opt_reduce_effects',
        category: 'reduce_effects',
        title: 'Bake heavy nested filters',
        description: 'Some clips contain more than 3 stacked heavy filters. Pre-rendering or flattening effects will prevent latency drops.',
        potentialSavings: {
          costReduction: 0.02,
          renderDurationReductionMs: 800,
          memoryReductionMb: 24,
        },
        effort: 'high',
      });
    }

    // Strategy 4: Caching opportunities
    const cachingOpps = clips.length > 10;
    if (cachingOpps) {
      proposals.push({
        id: 'opt_cache',
        category: 'cache_opportunities',
        title: 'Pre-cache composition regions',
        description: 'Caching complex timeline clip groups will bypass full frame re-evaluation during export.',
        potentialSavings: {
          costReduction: 0.1,
          renderDurationReductionMs: 2000,
          memoryReductionMb: -30, // Note: Caching can slightly increase memory
        },
        effort: 'low',
      });
    }

    // Strategy 5: Workflow improvements
    const slowWorkflowSteps = workflows.some(w => w.steps.length > 5);
    if (slowWorkflowSteps) {
      proposals.push({
        id: 'opt_workflow',
        category: 'workflow_improvements',
        title: 'Parallellize serial workflows',
        description: 'Large workflow sequence found. Run script steps in parallel to reduce overall execution delay.',
        potentialSavings: {
          costReduction: 0.01,
          renderDurationReductionMs: 500,
          memoryReductionMb: 10,
        },
        effort: 'medium',
      });
    }

    // Combine custom external strategies
    for (const strategy of this.strategies) {
      const customProps = await strategy.analyze(twin);
      proposals.push(...customProps);
    }

    return proposals;
  }
}
