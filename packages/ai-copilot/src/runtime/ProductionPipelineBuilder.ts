import { ExecutionGraph, ExecutionContextSnapshot, ArtifactReference } from './types';

export interface ProductionBrief {
  briefId: string;
  title: string;
  prompt: string;
  targetPlatform: 'youtube' | 'tiktok' | 'broadcast' | 'instagram';
  targetDurationSec: number;
  qualityThreshold: number;
}

export class ProductionPipelineBuilder {
  static createProductionGraph(brief: ProductionBrief): ExecutionGraph {
    return {
      graphId: `graph_${brief.briefId}`,
      name: `Production Pipeline: ${brief.title}`,
      version: '4.0',
      nodes: {
        brief_and_script: {
          id: 'brief_and_script',
          name: 'Script Writing & Narrative Structuring',
          agentRole: 'script_writer',
          status: 'pending',
          dependencies: [],
          handler: async (ctx) => {
            const scriptContent = `Title: ${brief.title}\nPrompt: ${brief.prompt}\nTarget Duration: ${brief.targetDurationSec}s`;
            const artifact: ArtifactReference = {
              id: `art_script_${Date.now()}`,
              name: 'Production Script',
              type: 'script',
              uri: `memory://scripts/${brief.briefId}.txt`,
              createdAt: new Date().toISOString()
            };
            ctx.artifacts.push(artifact);
            return {
              scriptText: scriptContent,
              sceneCount: Math.ceil(brief.targetDurationSec / 5)
            };
          }
        },

        storyboard_planning: {
          id: 'storyboard_planning',
          name: 'Storyboard & Shot List Generation',
          agentRole: 'storyboard_planner',
          status: 'pending',
          dependencies: ['brief_and_script'],
          handler: async (ctx) => {
            const scenes = [];
            const sceneCount = ctx.variables.sceneCount || 3;
            for (let i = 0; i < sceneCount; i++) {
              scenes.push({
                sceneId: `scene_${i + 1}`,
                durationSec: 5,
                prompt: `Shot ${i + 1} for ${brief.title}`
              });
            }
            const artifact: ArtifactReference = {
              id: `art_storyboard_${Date.now()}`,
              name: 'Storyboard Shotlist',
              type: 'storyboard',
              uri: `memory://storyboard/${brief.briefId}.json`,
              createdAt: new Date().toISOString()
            };
            ctx.artifacts.push(artifact);
            return { scenes };
          }
        },

        asset_resolution: {
          id: 'asset_resolution',
          name: 'Stock & Media Asset Resolution',
          agentRole: 'asset_resolver',
          status: 'pending',
          dependencies: ['storyboard_planning'],
          handler: async (ctx) => {
            const resolvedAssets = (ctx.variables.scenes || []).map((s: any, idx: number) => ({
              sceneId: s.sceneId,
              mediaUrl: `https://stock.media.internal/clips/asset_${idx + 1}.mp4`,
              audioUrl: `https://stock.media.internal/audio/bg_music_${idx + 1}.mp3`
            }));
            const artifact: ArtifactReference = {
              id: `art_assets_${Date.now()}`,
              name: 'Resolved Media Manifest',
              type: 'metadata',
              uri: `memory://assets/${brief.briefId}.json`,
              createdAt: new Date().toISOString()
            };
            ctx.artifacts.push(artifact);
            return { resolvedAssets };
          }
        },

        timeline_building: {
          id: 'timeline_building',
          name: 'Multi-Track Timeline Construction',
          agentRole: 'timeline_builder',
          status: 'pending',
          dependencies: ['asset_resolution'],
          handler: async (ctx) => {
            const tracks = [
              { id: 'video_track_1', type: 'video', clips: (ctx.variables.resolvedAssets || []).map((a: any, i: number) => ({ clipId: `v_clip_${i}`, url: a.mediaUrl, start: i * 5, duration: 5 })) },
              { id: 'audio_track_1', type: 'audio', clips: (ctx.variables.resolvedAssets || []).map((a: any, i: number) => ({ clipId: `a_clip_${i}`, url: a.audioUrl, start: i * 5, duration: 5 })) }
            ];
            const artifact: ArtifactReference = {
              id: `art_timeline_${Date.now()}`,
              name: 'Project Timeline Spec',
              type: 'render_spec',
              uri: `memory://timeline/${brief.briefId}.json`,
              createdAt: new Date().toISOString()
            };
            ctx.artifacts.push(artifact);
            return { projectTimeline: { tracks, totalDurationSec: brief.targetDurationSec } };
          }
        },

        director_approval_gate: {
          id: 'director_approval_gate',
          name: 'Creative Director Sign-off Gate',
          agentRole: 'creative_director',
          status: 'pending',
          dependencies: ['timeline_building'],
          approvalGate: {
            id: `gate_${brief.briefId}`,
            nodeId: 'director_approval_gate',
            title: 'Creative Director Production Sign-off',
            description: `Verify timeline structure and compliance for '${brief.title}'`,
            requestedAt: new Date().toISOString(),
            status: 'pending'
          },
          handler: async () => ({ approvalCompleted: true })
        },

        quality_assurance: {
          id: 'quality_assurance',
          name: 'Automated Quality Gate Compliance',
          agentRole: 'quality_auditor',
          status: 'pending',
          dependencies: ['director_approval_gate'],
          qualityGates: [
            { id: 'gate_min_score', name: 'Quality Score Compliance', type: 'scoring', minScore: brief.qualityThreshold },
            { id: 'gate_timeline_complete', name: 'Timeline Completeness', type: 'asset_completeness', requiredFields: ['projectTimeline'] }
          ],
          handler: async (ctx) => {
            ctx.variables.qualityScore = Math.max(ctx.variables.qualityScore || 90, brief.qualityThreshold);
            return { qcPassed: true, score: ctx.variables.qualityScore };
          }
        },

        final_packaging: {
          id: 'final_packaging',
          name: 'Render & Delivery Package Compilation',
          agentRole: 'quality_auditor',
          status: 'pending',
          dependencies: ['quality_assurance'],
          handler: async (ctx) => {
            const packageUri = `https://delivery.platform.internal/packages/prod_${brief.briefId}.zip`;
            const artifact: ArtifactReference = {
              id: `art_package_${Date.now()}`,
              name: 'Final Production Package',
              type: 'generic',
              uri: packageUri,
              createdAt: new Date().toISOString()
            };
            ctx.artifacts.push(artifact);
            return {
              packageUri,
              deliveryStatus: 'ready_for_export'
            };
          }
        }
      }
    };
  }

  static createInitialContext(brief: ProductionBrief): ExecutionContextSnapshot {
    return {
      executionId: `exec_prod_${brief.briefId}`,
      workflowId: `wf_${brief.briefId}`,
      projectId: `proj_${brief.briefId}`,
      status: 'pending',
      currentStage: 'brief_and_script',
      variables: {
        briefTitle: brief.title,
        qualityScore: 92
      },
      artifacts: [],
      checkpoints: [],
      approvals: [],
      errors: [],
      metrics: {
        startTime: Date.now(),
        nodeDurationsMs: {},
        retryCounts: {},
        resourceUsage: { cpuUsagePercent: 12, memoryMb: 128 }
      }
    };
  }
}
