import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  MotionGraphicsComposerEngine,
  CompositionLayer,
  PreCompositionLayer,
  CameraLayer,
} from '../src/index';

describe('Motion Graphics Composer SDK Core Unit Tests', () => {
  test('Hierarchical Parenting & Transform3D compounds', () => {
    const engine = new MotionGraphicsComposerEngine();

    const parent: CompositionLayer = {
      id: 'layer_parent',
      name: 'Parent Container',
      type: 'null',
      transform: {
        position: [100, 200, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1.0,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
    };

    const child: CompositionLayer = {
      id: 'layer_child',
      name: 'Child Icon',
      type: 'shape',
      parentId: 'layer_parent',
      transform: {
        position: [50, 50, 0],
        rotation: [0, 0, 0],
        scale: [2, 2, 2],
        anchorPoint: [10, 10],
        opacity: 0.8,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
    };

    const globalTransform = engine.layerService.getGlobalTransform(child, [parent, child]);

    assert.strictEqual(globalTransform.position[0], 150); // Parent position x + child position x
    assert.strictEqual(globalTransform.position[1], 250);
    assert.strictEqual(globalTransform.scale[0], 2); // Parent scale x * child scale x
    assert.strictEqual(globalTransform.opacity, 0.8);
  });

  test('Precomposition Cyclic Nesting validations', () => {
    const engine = new MotionGraphicsComposerEngine();

    engine.composerService.createComposition('comp_main', 'Main Comp');
    engine.composerService.createComposition('comp_sub_1', 'Sub Comp A');
    engine.composerService.createComposition('comp_sub_2', 'Sub Comp B');

    // Setup linear PreCompositions
    const layer1: PreCompositionLayer = {
      id: 'pre_l1',
      name: 'Nested Sub Comp A',
      type: 'pre_composition',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      nestedCompositionId: 'comp_sub_1',
      timeStretch: 1,
    };
    engine.composerService.addLayer('comp_main', layer1);

    const layer2: PreCompositionLayer = {
      id: 'pre_l2',
      name: 'Nested Sub Comp B',
      type: 'pre_composition',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      nestedCompositionId: 'comp_sub_2',
      timeStretch: 1,
    };
    engine.composerService.addLayer('comp_sub_1', layer2);

    // Assert NO cyclic nesting
    const check1 = engine.compositionService.hasCyclicNesting('comp_main', 'comp_sub_1');
    assert.strictEqual(check1, false);

    // Make cyclic: sub comp B nest main comp!
    const cycleLayer: PreCompositionLayer = {
      ...layer1,
      id: 'pre_cycle',
      nestedCompositionId: 'comp_main',
    };
    engine.composerService.addLayer('comp_sub_2', cycleLayer);

    const check2 = engine.compositionService.hasCyclicNesting('comp_main', 'comp_sub_2');
    assert.strictEqual(check2, true); // Cycle detected!
  });

  test('Rigging Look-At Kinematics & Follow Path', () => {
    const engine = new MotionGraphicsComposerEngine();

    const layerA: CompositionLayer = {
      id: 'tracker',
      name: 'Tracker Arrow',
      type: 'null',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
    };

    const layerB: CompositionLayer = {
      id: 'target',
      name: 'Target Spot',
      type: 'null',
      transform: {
        position: [100, 100, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
    };

    const constraints = [
      {
        id: 'const_1',
        type: 'look_at' as const,
        sourceLayerId: 'tracker',
        targetId: 'target',
        weight: 1.0,
      },
    ];

    engine.rigService.resolveConstraints(layerA, constraints, [layerA, layerB]);

    // Tracker should rotate pointing towards [100, 100] -> 45 degrees
    assert.strictEqual(layerA.transform.rotation[2], 45);
  });

  test('3D Camera projection & Depth of Field', () => {
    const engine = new MotionGraphicsComposerEngine();

    const camera: CameraLayer = {
      id: 'cam_1',
      name: 'Perspective Camera',
      type: 'camera',
      transform: {
        position: [0, 0, -50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      projection: 'perspective',
      focalLengthMm: 50,
      depthOfField: { enabled: true, apertureSize: 1.4, focusDistance: 100 },
    };

    const layer: CompositionLayer = {
      id: 'clip_1',
      name: '3D Panel',
      type: 'media',
      transform: {
        position: [10, 20, 50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
    };

    const pos2D = engine.cameraService.project3DTo2D(layer, camera, 1920, 1080);

    // projected points should shift proportionally
    assert.ok(pos2D[0] !== 10);
    assert.ok(pos2D[1] !== 20);
  });

  test('Template generation (MOGRT) and Overrides', () => {
    const engine = new MotionGraphicsComposerEngine();

    const comp = engine.composerService.createComposition('comp_template', 'Promo Comp');
    engine.composerService.addLayer('comp_template', {
      id: 'text_1',
      name: 'Main Title text',
      type: 'text',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      text: 'Original Title',
      fontFamily: 'Arial',
      fontSize: 24,
      alignment: 'center',
    } as any);

    const template = engine.templateService.generateTemplate(comp);
    assert.strictEqual(template.templateId, 'tpl_comp_template');
    assert.strictEqual(template.overrideableFields.length, 1);
    assert.strictEqual(template.overrideableFields[0].currentValue, 'Original Title');

    const preCompLayer: PreCompositionLayer = {
      id: 'pre_l1',
      name: 'Nested Template Comp',
      type: 'pre_composition',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      nestedCompositionId: 'comp_template',
      timeStretch: 1,
    };

    engine.templateService.applyOverrides(preCompLayer, { text_1: 'Custom Sundance Header' });
    assert.strictEqual(preCompLayer.overrides?.text_1, 'Custom Sundance Header');
  });
});
