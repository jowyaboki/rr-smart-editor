import { describe, test, before, beforeEach } from 'node:test';
import assert from 'node:assert';

import { AgentRegistry } from '../services/AgentRegistry.ts';
import { AgentMemoryService } from '../services/AgentMemoryService.ts';
import { AgentOrchestrator } from '../services/AgentOrchestrator.ts';

describe('AI Agent Studio Framework Tests', () => {
  const projectId = 'proj_agent_test';

  beforeEach(() => {
    AgentRegistry.initializeStandardAgents();
    AgentMemoryService.clearMemory(projectId);
  });

  test('AgentRegistry - initialize and support custom plugin registration', () => {
    // 1. Initialized 10 standard specialized agents
    const agents = AgentRegistry.getAllAgents();
    assert.strictEqual(agents.length, 10);

    const scriptAgent = AgentRegistry.getAgentByType('script');
    assert.ok(scriptAgent);
    assert.strictEqual(scriptAgent.name, 'Script Agent');
    assert.strictEqual(scriptAgent.status, 'idle');

    // 2. Custom plugin registration
    AgentRegistry.registerAgent({
      id: 'ag_custom_plugin',
      name: 'Custom Transcoder',
      type: 'rendering',
      capabilities: ['plugin_transcode'],
      status: 'idle',
    });

    const transcoder = AgentRegistry.getAllAgents().find((ag) => ag.id === 'ag_custom_plugin');
    assert.ok(transcoder);
    assert.ok(transcoder.capabilities.includes('plugin_transcode'));
  });

  test('AgentOrchestrator - single task delegation and logs simulation', async () => {
    const task = await AgentOrchestrator.delegateTask({
      projectId,
      taskName: 'Compose Tech Promo Script',
      agentType: 'script',
    });

    assert.ok(task.id.startsWith('task_'));
    assert.ok(task.status === 'pending' || task.status === 'running');

    // Wait for simulation loop to process
    await new Promise((resolve) => setTimeout(resolve, 400));

    const finalTask = AgentOrchestrator.getTask(task.id);
    assert.ok(finalTask);
    assert.strictEqual(finalTask.status, 'completed');
    assert.strictEqual(finalTask.progress, 100);
    assert.ok(finalTask.logs.length > 2);
    assert.ok(finalTask.output);
    assert.strictEqual(
      finalTask.output.body,
      'This is a beautifully composed project script cues.',
    );
  });

  test('AgentMemoryService - shared project memory contexts', () => {
    // 1. Log conversation
    AgentMemoryService.logConversation(projectId, 'user', 'Compose an outro script');
    const mem = AgentMemoryService.getMemory(projectId);
    assert.strictEqual(mem.context.conversationHistory.length, 1);
    assert.strictEqual(mem.context.conversationHistory[0].content, 'Compose an outro script');

    // 2. Save intermediate output
    AgentMemoryService.saveIntermediateOutput(projectId, 'caption_timeline', { timing: 'aligned' });
    const output = AgentMemoryService.getIntermediateOutput(projectId, 'caption_timeline');
    assert.ok(output);
    assert.strictEqual(output.timing, 'aligned');
  });

  test('AgentOrchestrator - task cancellation', async () => {
    const task = await AgentOrchestrator.delegateTask({
      projectId,
      taskName: 'Cancel task test',
      agentType: 'timeline',
    });

    AgentOrchestrator.cancelTask(task.id);
    const cancelledTask = AgentOrchestrator.getTask(task.id);
    assert.ok(cancelledTask);
    assert.strictEqual(cancelledTask.status, 'cancelled');
    assert.ok(cancelledTask.logs.some((l) => l.includes('Task execution cancelled')));
  });
});
