import { ToolDefinition, ToolResult, ExecutionContext } from '../types';
import { z } from 'zod';

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  public registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name ${tool.name} is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  public listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Safe permission check helper
   */
  public isAuthorized(toolName: string, allowedPermissions: string[]): boolean {
    const tool = this.getTool(toolName);
    if (!tool) return false;

    // If tool has no permissions required, it is authorized
    if (!tool.permissions || tool.permissions.length === 0) return true;

    // Check that all required tool permissions are in the allowedPermissions array
    return tool.permissions.every(p => allowedPermissions.includes(p));
  }
}

/**
 * Registry populated with the 13 built-in editor capabilities exposed as tools
 */
export class BuiltInToolsRegistry extends ToolRegistry {
  constructor() {
    super();
    this.registerBuiltInTools();
  }

  private registerBuiltInTools(): void {
    // 1. Project Tool
    this.registerTool({
      name: 'Project',
      description: 'Manage projects, create new projects, and load or query project metadata.',
      version: '1.0.0',
      permissions: ['read_project', 'write_project'],
      parameters: z.object({
        action: z.enum(['create', 'load', 'get_metadata']),
        projectId: z.string().optional(),
        name: z.string().optional(),
      }),
      executor: async (args, ctx) => {
        return {
          callId: 'project-call',
          success: true,
          result: { id: args.projectId || 'proj-1', name: args.name || 'Untitled Project', status: 'loaded' },
        };
      },
    });

    // 2. Scene Tool
    this.registerTool({
      name: 'Scene',
      description: 'Create, reorder, delete, or inspect narrative scenes in the active project storyboard.',
      version: '1.0.0',
      permissions: ['write_storyboard'],
      parameters: z.object({
        action: z.enum(['create', 'delete', 'reorder']),
        sceneId: z.string().optional(),
        order: z.number().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'scene-call', success: true, result: { sceneId: args.sceneId || 'scene-1', success: true } };
      },
    });

    // 3. Timeline Tool
    this.registerTool({
      name: 'Timeline',
      description: 'Perform timeline NLE operations like inserting clips, splitting, rippling, slipping, and sliding.',
      version: '1.0.0',
      permissions: ['write_timeline'],
      parameters: z.object({
        action: z.enum(['add_clip', 'split', 'ripple_edit', 'slide']),
        clipId: z.string().optional(),
        timeSeconds: z.number().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'timeline-call', success: true, result: { timelineUpdated: true, frameCount: 900 } };
      },
    });

    // 4. Assets Tool
    this.registerTool({
      name: 'Assets',
      description: 'Manage, ingest, list, tag, and query media library assets.',
      version: '1.0.0',
      permissions: ['read_assets', 'write_assets'],
      parameters: z.object({
        action: z.enum(['upload', 'tag', 'delete']),
        assetId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'assets-call', success: true, result: { assetId: args.assetId || 'asset-1', status: 'indexed' } };
      },
    });

    // 5. Variables Tool
    this.registerTool({
      name: 'Variables',
      description: 'Get, set, and bind dynamic session or automation template variables.',
      version: '1.0.0',
      permissions: ['write_project'],
      parameters: z.object({
        action: z.enum(['get', 'set']),
        key: z.string(),
        value: z.any().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'variables-call', success: true, result: { key: args.key, value: args.value, ok: true } };
      },
    });

    // 6. Templates Tool
    this.registerTool({
      name: 'Templates',
      description: 'Search, retrieve, and compile video automation design templates.',
      version: '1.0.0',
      permissions: ['read_project'],
      parameters: z.object({
        action: z.enum(['list', 'compile']),
        templateId: z.string(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'templates-call', success: true, result: { compiledId: args.templateId, url: 'https://cdn.example.com/compiled-template' } };
      },
    });

    // 7. Node Graph Tool
    this.registerTool({
      name: 'Node Graph',
      description: 'Manipulate project compositing and processing nodes, link parameters, or insert custom expressions.',
      version: '1.0.0',
      permissions: ['write_project'],
      parameters: z.object({
        action: z.enum(['add_node', 'connect', 'set_expression']),
        nodeId: z.string().optional(),
        expression: z.string().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'nodegraph-call', success: true, result: { nodeId: args.nodeId || 'node-1', state: 'active' } };
      },
    });

    // 8. Workflow Tool
    this.registerTool({
      name: 'Workflow',
      description: 'List workflow automation rules, execute scripts, and evaluate conditionals or loops.',
      version: '1.0.0',
      permissions: ['execute_script'],
      parameters: z.object({
        workflowId: z.string(),
        trigger: z.string(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'workflow-call', success: true, result: { runId: 'run-123', status: 'completed' } };
      },
    });

    // 9. Render Queue Tool
    this.registerTool({
      name: 'Render Queue',
      description: 'Enqueue asynchronous rendering jobs, monitor job telemetry, and cancel active transcodes.',
      version: '1.0.0',
      permissions: ['render'],
      parameters: z.object({
        action: z.enum(['enqueue', 'cancel', 'get_telemetry']),
        jobId: z.string().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'render-call', success: true, result: { jobId: args.jobId || 'job-456', status: 'queued', position: 1 } };
      },
    });

    // 10. Playback Tool
    this.registerTool({
      name: 'Playback',
      description: 'Control timeline preview playback, seek to time, seek to markers, change shuttle speed, or sync previews.',
      version: '1.0.0',
      permissions: ['playback_control'],
      parameters: z.object({
        action: z.enum(['play', 'pause', 'seek', 'shuttle']),
        timeSeconds: z.number().optional(),
        speed: z.number().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'playback-call', success: true, result: { playhead: args.timeSeconds ?? 0, playing: args.action === 'play' } };
      },
    });

    // 11. Media Browser Tool
    this.registerTool({
      name: 'Media Browser',
      description: 'Search, filter, and inspect proxied media files, and query audio peak waveforms.',
      version: '1.0.0',
      permissions: ['read_assets'],
      parameters: z.object({
        query: z.string(),
        type: z.enum(['video', 'audio', 'image', 'all']).optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'mediabrowser-call', success: true, result: { matches: [{ id: 'video-1', name: 'Intro.mp4' }] } };
      },
    });

    // 12. Effects Tool
    this.registerTool({
      name: 'Effects',
      description: 'Query available filters, apply non-destructive visual effects to clips, and modify opacity/blending.',
      version: '1.0.0',
      permissions: ['write_timeline'],
      parameters: z.object({
        action: z.enum(['apply', 'remove', 'get_available']),
        clipId: z.string(),
        effectType: z.string().optional(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'effects-call', success: true, result: { applied: args.effectType || 'blur', clipId: args.clipId } };
      },
    });

    // 13. Publishing Tool
    this.registerTool({
      name: 'Publishing',
      description: 'Export finalized renderings, select destination platform presets (YouTube, TikTok), and publish videos.',
      version: '1.0.0',
      permissions: ['publish'],
      parameters: z.object({
        preset: z.string(),
        destination: z.string(),
      }),
      executor: async (args, ctx) => {
        return { callId: 'publish-call', success: true, result: { uploadUrl: 'https://youtube.com/watch?v=final', published: true } };
      },
    });
  }
}
