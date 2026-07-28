import test from 'node:test';
import assert from 'node:assert';
import { globalVirtualStudioEngine, VirtualStudioEngine } from '../index';
import {
  VirtualStudioSchema,
  VirtualCamera,
  TrackingSource,
  TrackingFrameData,
  CompositeLayer,
  Transform3D,
} from '../types';

test('Virtual Camera Movement - Lens Presets, Bookmarks, Rig Solves', () => {
  const engine = new VirtualStudioEngine();

  const camera: VirtualCamera = {
    id: 'cam-test',
    name: 'A-Camera',
    type: 'perspective',
    transform: {
      position: [0, 1.6, 5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      anchorPoint: [0, 0],
      opacity: 1.0,
    },
    projection: 'perspective',
    fov: 60,
    focalLength: 50,
    lensPreset: '50mm_standard',
    depthOfField: { enabled: false, aperture: 2.8, focusDistance: 5.0, bladeCount: 9 },
    bookmarks: [],
  };

  // 1. Lens presets
  const presetCam = engine.cameraService.applyLensPreset(camera, '18mm_wide');
  assert.strictEqual(presetCam.focalLength, 18);
  assert.strictEqual(presetCam.fov, 90);

  // 2. Bookmarks creation and interpolation
  const bookmarkCam = engine.cameraService.createBookmark(camera, 'Close-Up View');
  assert.strictEqual(bookmarkCam.bookmarks.length, 1);
  assert.strictEqual(bookmarkCam.bookmarks[0].name, 'Close-Up View');

  const startTransform: Transform3D = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    anchorPoint: [0, 0],
    opacity: 1.0,
  };
  const endTransform: Transform3D = {
    position: [10, 10, 10],
    rotation: [0, 90, 0],
    scale: [2, 2, 2],
    anchorPoint: [0, 0],
    opacity: 0.5,
  };

  const middle = engine.cameraService.interpolator.interpolate(startTransform, endTransform, 0.5);
  assert.deepStrictEqual(middle.position, [5, 5, 5]);
  assert.deepStrictEqual(middle.scale, [1.5, 1.5, 1.5]);
  assert.strictEqual(middle.opacity, 0.75);

  // 3. Dolly Rig Solving
  const dollyTransform = engine.cameraService.solveRigConstraints(
    'dolly_track',
    startTransform,
    { trackLength: 10.0 },
    Math.PI, // sin(pi * 0.5) = 1.0 -> offset = 5.0
  );
  assert.ok(dollyTransform.position[0] > 4.9 && dollyTransform.position[0] < 5.1);
});

test('Compositing Translation - Green Screen Mapping & Layers', () => {
  const engine = new VirtualStudioEngine();

  const layer: CompositeLayer = {
    id: 'layer-test',
    name: 'Green Screen Talent',
    sourceId: 'clip-001',
    order: 1,
    visible: true,
    opacity: 0.9,
    blendMode: 'multiply',
    keying: {
      type: 'chroma_green_screen',
      chroma: { keyColor: '#00ff00', tolerance: 0.35, edgeFeather: 2, spillReduction: 0.6 },
      luma: { threshold: 0.5, tolerance: 0.1, invert: false },
    },
    transform3d: {
      position: [1, 2, 0],
      rotation: [0, 0, 45],
      scale: [1.2, 1.2, 1],
      anchorPoint: [0.5, 0.5],
      opacity: 1.0,
    },
    isVirtualSetBackground: false,
  };

  const effectsLayer = engine.compositingService.toEffectsLayer(layer, 'custom-source-stream');
  assert.strictEqual(effectsLayer.id, 'layer-test');
  assert.strictEqual(effectsLayer.opacity, 0.9);
  assert.strictEqual(effectsLayer.blendMode, 'multiply');
  assert.strictEqual(effectsLayer.transform.rotation, 45);

  const chain = effectsLayer.effects;
  assert.strictEqual(chain.effects.length, 1);
  assert.strictEqual(chain.effects[0].type, 'chroma_key');
  assert.strictEqual(chain.effects[0].parameters.keyColor.value, '#00ff00');
  assert.strictEqual(chain.effects[0].parameters.tolerance.value, 0.35);
});

test('Lens Calibration Solver - Mathematical Chessboard Math', () => {
  const engine = new VirtualStudioEngine();

  // Guided calibration steps using chess grids
  const observations = Array.from({ length: 8 }, (_, i) => ({
    gridPoint: [i % 4, Math.floor(i / 4), 0] as [number, number, number],
    observedPixels: [100 * i, 200] as [number, number],
  }));

  const result = engine.calibrationService.solveCalibration(observations, 1920, 1080);
  assert.strictEqual(result.errorMetrics.converged, true);
  assert.strictEqual(result.distortionModel.k1, -0.15);
  assert.strictEqual(result.lensMatrix[0][0], 1920 * 0.8); // fx

  const profile = engine.calibrationService.createProfile(result, 'Test Chess Profile');
  assert.strictEqual(profile.name, 'Test Chess Profile');
  assert.strictEqual(profile.lensDistortion.k1, -0.15);
});

test('Hardware Tracking Alignment & Latency Synchronization', () => {
  const engine = new VirtualStudioEngine();

  const source: TrackingSource = {
    id: 'track-01',
    name: 'Vive tracker anchor',
    type: 'camera_tracker',
    delayMs: 20,
    noiseFilterCutoff: 1.5,
    coordinateMapping: {
      scale: [1, 1, -1], // invert Z axis
      offset: [0.1, 0, 0.5],
    },
  };

  const rawFrame: TrackingFrameData = {
    timestamp: 1000,
    position: [2.0, 1.5, 4.0],
    rotation: [0, 0, 0],
    confidence: 0.95,
  };

  const camera: VirtualCamera = {
    id: 'cam-01',
    name: 'Virtual camera tracking',
    type: 'perspective',
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      anchorPoint: [0, 0],
      opacity: 1.0,
    },
    projection: 'perspective',
    fov: 60,
    focalLength: 50,
    lensPreset: '50mm_standard',
    depthOfField: { enabled: false, aperture: 2.8, focusDistance: 5.0, bladeCount: 9 },
    bookmarks: [],
  };

  const updatedCam = engine.trackingService.processTracking(source, rawFrame, camera);

  // Position solves scale [1, 1, -1] + offset [0.1, 0, 0.5]
  // raw position: [2.0, 1.5, 4.0] -> scaled: [2.0, 1.5, -4.0] -> offsetted: [2.1, 1.5, -3.5]
  assert.deepStrictEqual(updatedCam.transform.position, [2.1, 1.5, -3.5]);

  // Noise smoothing verify
  const rawFrame2: TrackingFrameData = {
    timestamp: 1016,
    position: [2.2, 1.5, 4.0],
    rotation: [0, 0, 0],
    confidence: 0.95,
  };
  const updatedCam2 = engine.trackingService.processTracking(source, rawFrame2, updatedCam);
  // smooth low pass verify position exists and is slightly smoothed
  assert.ok(updatedCam2.transform.position[0] > 2.1);
});

test('Serialization / Deserialization schema validations (Zod)', () => {
  const studioState = engineDefaultStudio();

  // Validate utilizing Zod schemas
  const parseResult = VirtualStudioSchema.safeParse(studioState);
  assert.strictEqual(parseResult.success, true);

  if (parseResult.success) {
    const serialized = JSON.stringify(parseResult.data);
    const deserialized = JSON.parse(serialized);

    const reparseResult = VirtualStudioSchema.safeParse(deserialized);
    assert.strictEqual(reparseResult.success, true);
    assert.strictEqual(reparseResult.data.id, 'studio-serialized');
    assert.strictEqual(reparseResult.data.stage.name, 'Test Stage');
  }
});

test('Large Scene Performance Stress Test', () => {
  const engine = new VirtualStudioEngine();
  const studio = engine.studioService.createStudio('studio-large', 'Stress Production Studio');

  // Populate 100+ cameras
  for (let i = 0; i < 110; i++) {
    studio.cameras[`cam-${i}`] = {
      id: `cam-${i}`,
      name: `Stress Cam ${i}`,
      type: 'perspective',
      transform: {
        position: [0, 1.6, 5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1.0,
      },
      projection: 'perspective',
      fov: 60,
      focalLength: 50,
      lensPreset: '50mm_standard',
      depthOfField: { enabled: false, aperture: 2.8, focusDistance: 5.0, bladeCount: 9 },
      bookmarks: [],
    };
  }

  // Populate 500+ lights
  for (let i = 0; i < 510; i++) {
    studio.lightRigs[`light-${i}`] = {
      id: `light-${i}`,
      name: `Stress Light ${i}`,
      type: 'point',
      transform: {
        position: [Math.sin(i), 4, Math.cos(i)],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1.0,
      },
      color: '#ffffff',
      intensity: 1.0,
      temperature: 6500,
      shadows: { enabled: false, bias: 0.005, radius: 4, resolution: 1024 },
      groupName: 'stress-group',
    };
  }

  // Verify building render instruction set does not bottleneck O(n2)
  const start = Date.now();
  const instructions = engine.renderInstructionBuilder.build(studio);
  const duration = Date.now() - start;

  assert.ok(duration < 25, 'Render instruction generation must evaluate fast (under 25ms)');
  assert.strictEqual(instructions.lights.length, 510);
});

test('Plugin Registration and Adapter validation', () => {
  const engine = new VirtualStudioEngine();

  const customCamera: any = {
    id: 'my-red-camera',
    name: 'RED V-Raptor Adapter',
    getTransform: () => ({
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      anchorPoint: [0, 0],
      opacity: 1.0,
    }),
    setLensPreset: () => {},
    setDepthOfField: () => {},
  };

  engine.pluginRegistry.registerCameraAdapter(customCamera);
  const retrieved = engine.pluginRegistry.getCameraAdapter('my-red-camera');
  assert.ok(retrieved);
  assert.strictEqual(retrieved?.name, 'RED V-Raptor Adapter');
});

// Mock helper
function engineDefaultStudio() {
  return {
    id: 'studio-serialized',
    name: 'Studio Test S/D',
    stage: {
      id: 'stage-1',
      name: 'Test Stage',
      dimensions: [10, 10, 5] as [number, number, number],
      gridSize: 1.0,
      originOffset: [0, 0, 0] as [number, number, number],
    },
    cameras: {},
    cameraRigs: {},
    lightRigs: {},
    environments: {},
    trackingSources: {},
    calibrationProfiles: {},
    virtualSets: {},
    version: '1.0.0',
    metadata: {},
  };
}
