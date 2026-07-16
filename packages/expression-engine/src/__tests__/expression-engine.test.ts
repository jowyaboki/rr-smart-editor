import { describe, test } from 'node:test';
import assert from 'node:assert';

import { ExpressionEngine } from '../expression-engine';
import { DependencyGraph } from '../dependency-graph';
import { parseExpression } from '../parser';

describe('Expression Engine Unit Tests', () => {
  test('Basic Parsing & Evaluation of Arithmetic', () => {
    const engine = new ExpressionEngine();

    // Arithmetic
    assert.strictEqual(engine.evaluate('1 + 2 * 3'), 7);
    assert.strictEqual(engine.evaluate('(1 + 2) * 3'), 9);
    assert.strictEqual(engine.evaluate('10 / 2 - 1'), 4);
    assert.strictEqual(engine.evaluate('2 ^ 3'), 8);
    assert.strictEqual(engine.evaluate('5 % 2'), 1);
    assert.strictEqual(engine.evaluate('-5 + 3'), -2);
  });

  test('Logic & Comparison Operators', () => {
    const engine = new ExpressionEngine();

    assert.strictEqual(engine.evaluate('true && false'), false);
    assert.strictEqual(engine.evaluate('true || false'), true);
    assert.strictEqual(engine.evaluate('!true'), false);
    assert.strictEqual(engine.evaluate('5 > 3'), true);
    assert.strictEqual(engine.evaluate('5 <= 3'), false);
    assert.strictEqual(engine.evaluate('10 == 10'), true);
    assert.strictEqual(engine.evaluate('10 != 5'), true);
  });

  test('Conditional (Ternary) Expressions', () => {
    const engine = new ExpressionEngine();

    assert.strictEqual(engine.evaluate('true ? 42 : 100'), 42);
    assert.strictEqual(engine.evaluate('false ? 42 : 100'), 100);
    assert.strictEqual(engine.evaluate('5 > 10 ? "yes" : "no"'), 'no');
  });

  test('Built-in Functions', () => {
    const engine = new ExpressionEngine();

    // clamp
    assert.strictEqual(engine.evaluate('clamp(15, 0, 10)'), 10);
    assert.strictEqual(engine.evaluate('clamp(-5, 0, 10)'), 0);
    assert.strictEqual(engine.evaluate('clamp(5, 0, 10)'), 5);

    // lerp
    assert.strictEqual(engine.evaluate('lerp(10, 20, 0.5)'), 15);

    // Math
    assert.strictEqual(engine.evaluate('abs(-42)'), 42);
    assert.strictEqual(engine.evaluate('floor(5.9)'), 5);
    assert.strictEqual(engine.evaluate('ceil(5.1)'), 6);
    assert.strictEqual(engine.evaluate('round(5.5)'), 6);
    assert.strictEqual(engine.evaluate('min(1, 5, -2, 10)'), -2);
    assert.strictEqual(engine.evaluate('max(1, 5, -2, 10)'), 10);
  });

  test('Built-in variables and custom inputs', () => {
    const engine = new ExpressionEngine();
    const vars = {
      time: 2.5,
      frame: 75,
      fps: 30,
      duration: 10,
    };

    assert.strictEqual(engine.evaluate('time * fps', vars), 75);
    assert.strictEqual(engine.evaluate('frame / fps', vars), 2.5);
    assert.strictEqual(engine.evaluate('time == duration ? 1 : 0', vars), 0);
  });

  test('Arrays and Objects support', () => {
    const engine = new ExpressionEngine();

    const arrResult = engine.evaluate('[1, 2, 3 + 4]');
    assert.deepStrictEqual(arrResult, [1, 2, 7]);

    const objResult = engine.evaluate('{ x: 10, y: 20 + 5 }');
    assert.deepStrictEqual(objResult, { x: 10, y: 25 });

    // Member access
    const vars = {
      layer: {
        position: [100, 200],
        opacity: 50,
      },
    };
    assert.strictEqual(engine.evaluate('layer.opacity', vars), 50);
    assert.strictEqual(engine.evaluate('layer.position[1]', vars), 200);
  });

  test('Sandbox Security & Prototype Pollution Protection', () => {
    const engine = new ExpressionEngine();
    const vars = { layer: {} };

    // Ensure forbidden keys throw error
    assert.throws(() => {
      engine.evaluate('layer.prototype', vars);
    }, /forbidden/i);

    assert.throws(() => {
      engine.evaluate('layer.__proto__', vars);
    }, /forbidden/i);

    assert.throws(() => {
      engine.evaluate('layer.constructor', vars);
    }, /forbidden/i);

    // Object literals should also forbid them
    assert.throws(() => {
      engine.evaluate('{ __proto__: 1 }');
    }, /forbidden/i);
  });

  test('Dependency Graph, Cycle Detection and Topological Order', () => {
    const graph = new DependencyGraph();

    graph.addNode('position', ['time', 'layer.scale']);
    graph.addNode('layer.scale', ['custom_var']);
    graph.addNode('custom_var', []);

    // No cycle should be detected
    assert.strictEqual(graph.hasCycle(), false);

    const order = graph.getEvaluationOrder();
    // custom_var has no deps, should evaluate before layer.scale, which should evaluate before position
    assert.ok(order.indexOf('custom_var') < order.indexOf('layer.scale'));
    assert.ok(order.indexOf('layer.scale') < order.indexOf('position'));

    // Introduce cycle
    graph.addNode('custom_var', ['position']);
    assert.strictEqual(graph.hasCycle(), true);
    assert.throws(() => {
      graph.getEvaluationOrder();
    }, /Circular dependency/);
  });

  test('Multiple Expression Evaluation (evaluateAll)', () => {
    const engine = new ExpressionEngine();
    const expressions = {
      'layer.opacity': 'time * 10',
      'layer.scale': 'layer.opacity * 2',
      'layer.position': '[layer.scale + 10, 100]',
    };

    const results = engine.evaluateAll(expressions, { time: 5 });
    assert.strictEqual(results['layer.opacity'], 50);
    assert.strictEqual(results['layer.scale'], 100);
    assert.deepStrictEqual(results['layer.position'], [110, 100]);
  });

  test('Plugin Extensions Support', () => {
    const engine = new ExpressionEngine();

    // Register custom function
    engine.registerFunction('multiplyByTen', (x: number) => x * 10);
    assert.strictEqual(engine.evaluate('multiplyByTen(5)'), 50);

    // Register custom variable
    engine.registerVariable('myCustomVal', 100);
    assert.strictEqual(engine.evaluate('myCustomVal + 5'), 105);

    // Register custom property binding
    let dynamicVal = 5;
    engine.registerPropertyBinding('activeClipLength', () => dynamicVal);
    assert.strictEqual(engine.evaluate('activeClipLength * 2'), 10);
    dynamicVal = 10;
    assert.strictEqual(engine.evaluate('activeClipLength * 2'), 20);

    // Custom Validator
    engine.registerValidator((expr, ast) => {
      if (expr.includes('forbiddenWord')) {
        return { message: 'Forbidden word used!' };
      }
      return null;
    });

    const err = engine.validate('forbiddenWord + 5');
    assert.ok(err);
    assert.strictEqual(err.message, 'Forbidden word used!');
  });
});
