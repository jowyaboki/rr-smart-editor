import { WorkflowTemplate } from '@ai-video-editor/shared';

export const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl_auto_caption',
    name: 'Automated AI Captioning Pipeline',
    description: 'Prompts AI to generate a script, synthesizes voiceovers, inserts audio and text caption clips, and sends a notification when complete.',
    category: 'AI & Scripting',
    workflow: {
      name: 'Automated AI Captioning Flow',
      trigger: { type: 'manual' },
      variables: [
        { name: 'scriptPrompt', type: 'string', value: 'Create a 15 second promo for a high-tech AI video editor app.', scope: 'execution' },
        { name: 'voiceType', type: 'string', value: 'male_accent', scope: 'execution' },
        { name: 'generatedScript', type: 'string', value: '', scope: 'execution' },
        { name: 'generatedVoice', type: 'json', value: null, scope: 'execution' },
      ],
      steps: [
        {
          id: 'step_1_ai_script',
          name: 'Generate Script Prompt',
          type: 'ai_task',
          config: {
            prompt: 'Write a script for: ${scriptPrompt}',
            taskType: 'script',
            outputVariable: 'generatedScript',
          },
          nextStepId: 'step_2_ai_voice',
        },
        {
          id: 'step_2_ai_voice',
          name: 'Generate AI Voiceover',
          type: 'ai_task',
          config: {
            prompt: 'Synthesize the voiceover for: ${generatedScript} using style ${voiceType}',
            taskType: 'voiceover',
            outputVariable: 'generatedVoice',
          },
          nextStepId: 'step_3_insert_voice',
        },
        {
          id: 'step_3_insert_voice',
          name: 'Insert Audio Voice Clip',
          type: 'command',
          config: {
            actionId: 'insert_clip',
            arguments: {
              type: 'audio',
              name: 'AI Voiceover',
              start: 0,
              duration: 450, // 15s at 30fps
              url: '${generatedVoice.url}',
            },
          },
          nextStepId: 'step_4_captions',
        },
        {
          id: 'step_4_captions',
          name: 'Generate Captions Lane',
          type: 'command',
          config: {
            actionId: 'generate_captions',
            arguments: {
              prompt: '${generatedScript}',
            },
          },
          nextStepId: 'step_5_notify',
        },
        {
          id: 'step_5_notify',
          name: 'Notify Complete',
          type: 'notification',
          config: {
            title: 'Captioning Complete',
            message: 'Your automated captioning and voice synthesis pipeline finished successfully.',
            level: 'info',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'tpl_smart_montage',
    name: 'Smart Media Montage Creator',
    description: 'Loops over media library file imports, creates a brand new project, inserts video sequences, applies transitions, and initiates render.',
    category: 'Automation & Assembly',
    workflow: {
      name: 'Smart Media Montage Flow',
      trigger: { type: 'manual' },
      variables: [
        { name: 'montageProjectName', type: 'string', value: 'High Tech Travel Montage', scope: 'project' },
        {
          name: 'mediaSources',
          type: 'json',
          value: [
            { name: 'Beach Sunset', url: 'https://cdn.com/beach.mp4', duration: 120 },
            { name: 'City Skyline', url: 'https://cdn.com/city.mp4', duration: 150 },
            { name: 'Mountain Hike', url: 'https://cdn.com/mountain.mp4', duration: 180 },
          ],
          scope: 'execution',
        },
      ],
      steps: [
        {
          id: 'montage_step_1_create',
          name: 'Create Creative Project',
          type: 'command',
          config: {
            actionId: 'create_project',
            arguments: { name: '${montageProjectName}' },
          },
          nextStepId: 'montage_step_2_loop',
        },
        {
          id: 'montage_step_2_loop',
          name: 'Loop Assets Sequence',
          type: 'loop',
          config: {
            items: '${mediaSources}',
            steps: [
              {
                id: 'sub_step_insert',
                name: 'Insert Travel Clip',
                type: 'command',
                config: {
                  actionId: 'insert_clip',
                  arguments: {
                    type: 'video',
                    name: '${loopItem.name}',
                    url: '${loopItem.url}',
                    duration: '${loopItem.duration}',
                    start: 0,
                  },
                },
                nextStepId: 'sub_step_transition',
              },
              {
                id: 'sub_step_transition',
                name: 'Apply Seamless Transition',
                type: 'command',
                config: {
                  actionId: 'apply_transition',
                  arguments: { type: 'cross_fade', duration: 30 },
                },
              },
            ],
          },
          nextStepId: 'montage_step_3_render',
        },
        {
          id: 'montage_step_3_render',
          name: 'Trigger Final Render',
          type: 'render',
          config: {
            projectId: '${lastCreatedProjectId}',
            outputVariable: 'renderResult',
          },
          nextStepId: 'montage_step_4_notify',
        },
        {
          id: 'montage_step_4_notify',
          name: 'Dispatch Ready Alert',
          type: 'notification',
          config: {
            title: 'Montage Rendering',
            message: 'Montage project has been assembled and sent to the rendering engine queue.',
            level: 'success',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'tpl_render_notify',
    name: 'Scheduled Render & Alert Pipeline',
    description: 'Polls/opens active project, delays 2 seconds to simulate asset check, triggers server render, and notifies user of result.',
    category: 'Rendering',
    workflow: {
      name: 'Scheduled Render & Alert Flow',
      trigger: { type: 'project_save' },
      variables: [
        { name: 'notifyEmail', type: 'string', value: 'editor@creativecompany.com', scope: 'environment' },
      ],
      steps: [
        {
          id: 'rn_step_1_delay',
          name: 'Simulate Asset Audit Delay',
          type: 'delay',
          config: {
            durationMs: 2000,
          },
          nextStepId: 'rn_step_2_render',
        },
        {
          id: 'rn_step_2_render',
          name: 'Submit Render Request',
          type: 'render',
          config: {
            outputVariable: 'finalRenderOutput',
          },
          nextStepId: 'rn_step_3_notify',
        },
        {
          id: 'rn_step_3_notify',
          name: 'Dispatch Completion Alert',
          type: 'notification',
          config: {
            title: 'Render Queue Dispatched',
            message: 'Your composition has finished rendering. Completion mail sent to: ${notifyEmail}',
            level: 'info',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];
