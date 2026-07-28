import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  WorkflowDesigner,
  ValidationService,
  DebuggerService,
  MonitoringService,
  ExecutionBridge,
} from '../src/index';

describe('Enterprise Workflow Designer Core Unit Tests', () => {

  test('Draggable Node Type registrations', () => {
    const designer = new WorkflowDesigner();

    // Verify built-in node registrations are loaded
    const manualTrigger = designer.registry.getNodeTypeInfo('manual');
    assert.ok(manualTrigger);
    assert.strictEqual(manualTrigger?.category, 'trigger');

    const voiceGen = designer.registry.getNodeTypeInfo('voice_gen');
    assert.ok(voiceGen);
    assert.strictEqual(voiceGen?.category, 'ai');
  });

  test('Topological Loop validations', () => {
    const validation = new ValidationService();

    // 1. Scenario: Good non-circular workflow
    const goodWorkflow = {
      id: 'wf-1',
      name: 'Explainer Pipeline',
      description: 'Generates exp video',
      version: '1.0.0',
      nodes: [
        { id: 'n-1', name: 'Start', category: 'trigger' as const, type: 'manual', position: { x: 0, y: 0 }, config: {} },
        { id: 'n-2', name: 'Prompt AI', category: 'ai' as const, type: 'prompt', position: { x: 100, y: 0 }, config: {} },
      ],
      edges: [
        { id: 'e-1', sourceNodeId: 'n-1', targetNodeId: 'n-2' }
      ],
    };

    const audit1 = validation.validateWorkflow(goodWorkflow);
    assert.strictEqual(audit1.valid, true);

    // 2. Scenario: Circular cycle workflow (n-1 -> n-2 -> n-1)
    const circularWorkflow = {
      ...goodWorkflow,
      edges: [
        { id: 'e-1', sourceNodeId: 'n-1', targetNodeId: 'n-2' },
        { id: 'e-2', sourceNodeId: 'n-2', targetNodeId: 'n-1' }, // loop back!
      ],
    };

    const audit2 = validation.validateWorkflow(circularWorkflow);
    assert.strictEqual(audit2.valid, false);
    assert.ok(audit2.errors[0].includes('CIRCULAR_WORKFLOW_DETECTED'));
  });

  test('Debugger step pauses, logging and breakpoints', () => {
    const debug = new DebuggerService();

    // Toggle breakpoint on node
    debug.toggleBreakpoint('n-promo', true);
    assert.strictEqual(debug.hasBreakpoint('n-promo'), true);

    // Record custom trace debug event
    debug.logNodeEvent('n-promo', 'info', 'Compiled successfully.');
    const logs = debug.getLogsForNode('n-promo');
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].message, 'Compiled successfully.');

    // Step forward check
    assert.strictEqual(debug.getStepIndex(), 0);
    debug.incrementStep();
    assert.strictEqual(debug.getStepIndex(), 1);
  });

  test('Visual layout compilation to core Engine JSON rules', () => {
    const bridge = new ExecutionBridge();

    const workflow = {
      id: 'wf-test',
      name: 'Test Workflow',
      description: 'Test compilation',
      version: '1.0.0',
      nodes: [
        { id: 'n-1', name: 'Trigger', category: 'trigger' as const, type: 'manual', position: { x: 0, y: 0 }, config: { autoStart: true } }
      ],
      edges: [],
    };

    const compiledJson = bridge.compileToWorkflowEngineDefinition(workflow);
    assert.ok(typeof compiledJson === 'string');

    const parsed = JSON.parse(compiledJson);
    assert.strictEqual(parsed.workflowId, 'wf-test');
    assert.strictEqual(parsed.tasks[0].id, 'n-1');
    assert.strictEqual(parsed.tasks[0].parameters.autoStart, true);
  });
});
