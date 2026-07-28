import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  AgentRuntime,
  BuiltInToolsRegistry,
  MemoryService,
  PlannerService,
  ContextService,
  ExecutionService,
} from '../src/index';

describe('AI Agent Framework & Tool Calling Runtime Core Unit Tests', () => {

  test('Tool Registration and Allowed Permissions Enforcements', () => {
    const registry = new BuiltInToolsRegistry();

    // Verify built-in tools are successfully registered
    const timelineTool = registry.getTool('Timeline');
    assert.ok(timelineTool);
    assert.strictEqual(timelineTool?.name, 'Timeline');
    assert.strictEqual(timelineTool?.version, '1.0.0');

    // Test permission enforcements
    const hasTimelineAccess = registry.isAuthorized('Timeline', ['write_timeline']);
    assert.strictEqual(hasTimelineAccess, true);

    const missingAccess = registry.isAuthorized('Timeline', ['read_project']);
    assert.strictEqual(missingAccess, false);
  });

  test('Conversational and Project Context Memory Persistence', () => {
    const memory = new MemoryService();

    // 1. Check conversation recording
    memory.addMessage('user', 'Draft template for youtube promo');
    memory.addMessage('assistant', 'Created Youtube template successfully.');

    const history = memory.getConversationHistory();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].role, 'user');
    assert.strictEqual(history[1].role, 'assistant');

    // 2. Check project memory recording
    memory.updateProjectMemory('activeTheme', 'dark-purple');
    assert.strictEqual(memory.project.activeTheme, 'dark-purple');
  });

  test('Multi-Step Topologically Ordered Planning Batching', () => {
    const planner = new PlannerService();

    // Generate multi-step plan
    const plan = planner.generatePlan('Generate video intro and render output');
    assert.ok(plan.tasks.length > 1);

    // Verify task topological dependency sorting batches
    const batches = planner.getExecutionOrder(plan);
    assert.ok(batches.length > 0);

    // First batch must have no dependencies
    const firstBatch = batches[0];
    firstBatch.forEach(t => {
      assert.strictEqual(t.dependencies.length, 0);
    });
  });

  test('Secure Sandbox Tool Execution and active Cancellations', async () => {
    const executionService = new ExecutionService();
    const context = {
      projectId: 'proj-123',
      selection: { selectedClipIds: [], selectedTrackId: null, selectedMarkerId: null },
      timelineState: { playhead: 0, zoom: 1, duration: 30, fps: 30 },
      variables: {},
      assets: [],
      userPreferences: {},
      openPanels: [],
      isCancelled: false,
    };

    // 1. Execute safe authorized project tool call
    const result = await executionService.executeToolCall(
      { id: 'c-1', toolName: 'Project', arguments: { action: 'create', name: 'Agent Promo' } },
      context,
      { permissions: ['read_project', 'write_project'] }
    );
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.result.name, 'Agent Promo');

    // 2. Security violation allowlist violation check
    const badResult = await executionService.executeToolCall(
      { id: 'c-2', toolName: 'Project', arguments: { action: 'create' } },
      context,
      { allowedTools: ['Timeline'] } // Only timeline allowed
    );
    assert.strictEqual(badResult.success, false);
    assert.strictEqual(badResult.error?.code, 'SECURITY_VIOLATION');

    // 3. User cancellation check
    const cancelledContext = { ...context, isCancelled: true };
    const cancelledResult = await executionService.executeToolCall(
      { id: 'c-3', toolName: 'Project', arguments: { action: 'create' } },
      cancelledContext
    );
    assert.strictEqual(cancelledResult.success, false);
    assert.strictEqual(cancelledResult.error?.code, 'CANCELLED');
  });
});
