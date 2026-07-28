import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  EffectsEngine,
  EffectFactory,
  BlendService,
  MaskService,
  GPUCacheManager,
  LRUCache,
  Compositor,
  CanvasShader,
} from '../src/index';

describe('Effects & Compositing Engine Core Unit Tests', () => {

  test('Effect Factory and Parameter Serialization', () => {
    // 1. Create a Blur effect
    const blur = EffectFactory.createBlur(12);
    assert.strictEqual(blur.name, 'Blur');
    assert.strictEqual(blur.type, 'blur');
    assert.strictEqual(blur.enabled, true);
    assert.strictEqual(blur.parameters.radius.value, 12);

    // 2. Create the master EffectsEngine
    const engine = new EffectsEngine();

    // 3. Serialize the Effect Chain
    const chain = { id: 'test-chain', effects: [blur] };
    const serialized = engine.serializeChain(chain);
    assert.ok(typeof serialized === 'string');
    assert.ok(serialized.includes('test-chain'));
    assert.ok(serialized.includes('radius'));

    // 4. Deserialize the chain back
    const deserialized = engine.deserializeChain(serialized);
    assert.strictEqual(deserialized.id, 'test-chain');
    assert.strictEqual(deserialized.effects[0].type, 'blur');
    assert.strictEqual(deserialized.effects[0].parameters.radius.value, 12);
  });

  test('BlendService Modes Mapping & software blend pixel logic', () => {
    // Check that we correctly map standard blend modes to canvas compositing rules
    assert.strictEqual(BlendService.mapToCompositeOperation('normal'), 'source-over');
    assert.strictEqual(BlendService.mapToCompositeOperation('multiply'), 'multiply');
    assert.strictEqual(BlendService.mapToCompositeOperation('screen'), 'screen');
    assert.strictEqual(BlendService.mapToCompositeOperation('overlay'), 'overlay');
    assert.strictEqual(BlendService.mapToCompositeOperation('soft_light'), 'soft-light');
    assert.strictEqual(BlendService.mapToCompositeOperation('linear_dodge'), 'plus-lighter');

    // Safe mock pixel blending calculations (Normal / Multiply / Screen)
    const backdrop = new Uint8ClampedArray([100, 100, 100, 255]); // grey
    const source = new Uint8ClampedArray([200, 200, 200, 255]);   // light grey
    const out = new Uint8ClampedArray(4);

    // Normal blending
    BlendService.blendPixels(backdrop, source, out, 'normal', 1.0);
    assert.strictEqual(out[0], 200); // output matches source exactly at opacity 1

    // Multiply blending
    BlendService.blendPixels(backdrop, source, out, 'multiply', 1.0);
    // (100/255) * (200/255) * 255 = 78
    assert.ok(out[0] >= 77 && out[0] <= 79);
  });

  test('Mask Evaluation & Points/Inversions', () => {
    const mask = {
      id: 'test-mask',
      name: 'Test Mask',
      type: 'shape' as const,
      enabled: true,
      inverted: false,
      feather: 5,
      expansion: 10,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ], // Square
    };

    // Evaluate point inside square (50, 50)
    const insideVal = MaskService.evaluateMaskPixel(mask, 50, 50, 200, 200);
    assert.strictEqual(insideVal, 1.0); // Inside polygon -> fully opaque mask

    // Evaluate point outside square (150, 150)
    const outsideVal = MaskService.evaluateMaskPixel(mask, 150, 150, 200, 200);
    assert.strictEqual(outsideVal, 0.0); // Outside -> fully transparent mask

    // Test Inverted Mask behavior
    const invertedMask = { ...mask, inverted: true };
    const insideInverted = MaskService.evaluateMaskPixel(invertedMask, 50, 50, 200, 200);
    assert.strictEqual(insideInverted, 0.0); // Inverted inside -> transparent
  });

  test('GPU / CPU Cache Eviction & LRU Policies', () => {
    // Cache has max size 3 entries
    const cache = new LRUCache<string>(3);

    cache.set('key1', 'val1');
    cache.set('key2', 'val2');
    cache.set('key3', 'val3');
    assert.strictEqual(cache.getCount(), 3);

    // Access key1 to make it most recently used
    cache.get('key1');

    // Add fourth item which should evict key2 (since key1 was accessed, key2 is oldest)
    cache.set('key4', 'val4');
    assert.strictEqual(cache.getCount(), 3);
    assert.strictEqual(cache.get('key2'), undefined); // Evicted!
    assert.strictEqual(cache.get('key1'), 'val1');    // Still there!
    assert.strictEqual(cache.get('key4'), 'val4');
  });

  test('Plugin Registration of Custom Shaders & Visual Effects', () => {
    const engine = new EffectsEngine();

    // 1. Register a custom Canvas shader plugin
    const customShader = new CanvasShader('custom-sepia', 'Plugin Sepia', (ctx, w, h, params) => {
      ctx.fillStyle = 'rgba(112, 66, 20, 0.3)';
      ctx.fillRect(0, 0, w, h);
    });
    engine.shaderRegistry.registerShader(customShader);

    const retrieved = engine.shaderRegistry.getShader('custom-sepia');
    assert.ok(retrieved);
    assert.strictEqual(retrieved?.name, 'Plugin Sepia');

    // 2. Register custom visual effect plugin
    engine.effectRegistry.registerEffect(
      'glitch',
      'Plugin Glitch',
      () => ({
        id: 'glitch-1',
        name: 'Glitch Effect',
        type: 'glitch',
        enabled: true,
        parameters: {
          frequency: { id: 'frequency', name: 'Frequency', type: 'number', value: 0.5, default: 0.5 },
        },
      }),
      (ctx, w, h, effect) => {
        // custom execution code
      }
    );

    const created = engine.effectRegistry.createEffect('glitch');
    assert.strictEqual(created.name, 'Glitch Effect');
    assert.strictEqual(created.parameters.frequency.value, 0.5);
  });
});
