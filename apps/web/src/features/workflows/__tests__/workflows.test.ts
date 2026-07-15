import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { WorkflowRegistry } from '../services/WorkflowRegistry';
import { WorkflowEngine } from '../engine/WorkflowEngine';
import { ExecutionService } from '../execution/ExecutionService';
import { ValidationService } from '../services/ValidationService';
import { TemplateService } from '../services/TemplateService';
import { Workflow, WorkflowStep, WorkflowVariable } from '@ai-video-editor/shared';

describe('Workflow Automation Engine Foundation Tests', () => {

  beforeEach(() => {
    WorkflowRegistry.initialize();
    ExecutionService.clear();
    TemplateService.initialize();
  });

  test('Workflow Creation & Template Instantiation', () => {
    const templates = TemplateService.getAllTemplates();
    assert.ok(templates.length >= 3);

    const wf = TemplateService.instantiateTemplate('tpl_smart_montage', 'My Holiday Montage');
    assert.strictEqual(wf.name, 'My Holiday Montage');
    assert.ok(wf.id.startsWith('wf_'));
    assert.strictEqual(wf.steps.length, 4);
    assert.strictEqual(wf.variables.length, 2);
  });

  test('Variable Resolution & Variable Evaluation', () => {
    const context: any = {
      variables: {
        creatorName: 'Jules',
        loopIndex: 2,
        meta: { frameCount: 300 },
      },
      env: {
        VITE_API_URL: 'http://test-server:3001',
      },
    };

    const str1 = 'Creator: ${creatorName}';
    const str2 = 'Target API: {{VITE_API_URL}}';

    const resolvedStr1 = WorkflowEngine.resolveVariables(str1, context);
    const resolvedStr2 = WorkflowEngine.resolveVariables(str2, context);

    assert.strictEqual(resolvedStr1, 'Creator: Jules');
    assert.strictEqual(resolvedStr2, 'Target API: http://test-server:3001');

    const config = {
      nested: {
        label: 'Frame counts: ${loopIndex}',
      },
    };
    const resolvedConfig = WorkflowEngine.resolveVariables(config, context);
    assert.strictEqual(resolvedConfig.nested.label, 'Frame counts: 2');
  });

  test('Workflow Validation - Cycle & Parameter Checks', () => {
    const wf: Workflow = {
      id: 'wf_valid_1',
      name: 'Valid Linear Flow',
      trigger: { type: 'manual' },
      variables: [],
      steps: [
        {
          id: 'step_linear_1',
          name: 'Delay Start',
          type: 'delay',
          config: { durationMs: 50 },
          nextStepId: 'step_linear_2',
        },
        {
          id: 'step_linear_2',
          name: 'Display Alert',
          type: 'notification',
          config: { title: 'Finished', message: 'Task complete', level: 'info' },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const errors = ValidationService.validateWorkflow(wf);
    assert.strictEqual(errors.length, 0);

    const cyclicWf: Workflow = {
      ...wf,
      id: 'wf_cyclic_1',
      steps: [
        {
          id: 'step_cycle_1',
          name: 'Infinite Step A',
          type: 'delay',
          config: { durationMs: 100 },
          nextStepId: 'step_cycle_2',
          collapsed: false,
        },
        {
          id: 'step_cycle_2',
          name: 'Infinite Step B',
          type: 'delay',
          config: { durationMs: 100 },
          nextStepId: 'step_cycle_1',
          collapsed: false,
        },
      ],
    };

    const cyclicErrors = ValidationService.validateWorkflow(cyclicWf);
    assert.ok(cyclicErrors.some((e) => e.message.includes('Infinite connection loop detected')));

    const badDelayWf: Workflow = {
      ...wf,
      steps: [
        {
          id: 'step_bad_1',
          name: 'Invalid Delay',
          type: 'delay',
          config: {},
        },
      ],
    };
    const badDelayErrors = ValidationService.validateWorkflow(badDelayWf);
    assert.ok(badDelayErrors.some((e) => e.message.includes('requires a numeric "durationMs"')));
  });

  test('Workflow Execution - Standard & Branching Conditions', async () => {
    const wf: Workflow = {
      id: 'wf_test_cond',
      name: 'Branching Flow',
      trigger: { type: 'manual' },
      variables: [
        { name: 'score', type: 'number', value: 85, scope: 'execution' },
        { name: 'branchRun', type: 'string', value: 'none', scope: 'execution' },
      ],
      steps: [
        {
          id: 'step_branch',
          name: 'Check score',
          type: 'condition',
          config: {
            field: 'score',
            operator: 'greater_than',
            value: '80',
            ifTrueStepId: 'step_true_branch',
            ifFalseStepId: 'step_false_branch',
          },
        },
        {
          id: 'step_true_branch',
          name: 'Set True Variable',
          type: 'script',
          config: {
            scriptCode: 'context.variables.branchRun = "true_side";',
          },
        },
        {
          id: 'step_false_branch',
          name: 'Set False Variable',
          type: 'script',
          config: {
            scriptCode: 'context.variables.branchRun = "false_side";',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const execution = await ExecutionService.startExecution(wf);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const finalExec = ExecutionService.getExecution(execution.id);
    assert.ok(finalExec);
    assert.strictEqual(finalExec.status, 'completed');
    assert.strictEqual(finalExec.context.variables.branchRun, 'true_side');
  });

  test('Workflow Execution - Cancellation Workflow', async () => {
    const wf: Workflow = {
      id: 'wf_test_cancel',
      name: 'Long Delayed Flow',
      trigger: { type: 'manual' },
      variables: [],
      steps: [
        {
          id: 'step_long_delay',
          name: 'Very Long Delay',
          type: 'delay',
          config: { durationMs: 2000 },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const execution = await ExecutionService.startExecution(wf);

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.strictEqual(execution.status, 'running');

    await ExecutionService.cancelExecution(execution.id);

    assert.strictEqual(execution.status, 'cancelled');
    assert.ok(execution.endedAt);
  });

  test('JSON Schema Metadata Import and Export', () => {
    const origWf = TemplateService.instantiateTemplate('tpl_auto_caption', 'Test Import Export');

    const jsonStr = TemplateService.exportWorkflowToJson(origWf);
    assert.ok(jsonStr.includes('tpl_auto_caption') === false);

    const importedWf = TemplateService.importWorkflowFromJson(jsonStr);
    assert.strictEqual(importedWf.name, 'Test Import Export');
    assert.strictEqual(importedWf.steps.length, 5);
    assert.strictEqual(importedWf.variables.length, 4);
  });
});
