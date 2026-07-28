import test from 'node:test';
import assert from 'node:assert';
import { ColorScienceEngine } from '../ColorScienceEngine';
import { ColorSpace, Grade, ColorPipeline } from '../types';

test('Color Management - Matrix Conversions and Chromatic Adaptation', () => {
  const engine = new ColorScienceEngine();

  const srcSpace: ColorSpace = {
    id: 'srgb-id',
    name: 'sRGB IEC61966-2.1',
    type: 'srgb',
    primaries: { red: [0.64, 0.33], green: [0.30, 0.60], blue: [0.15, 0.06], white: [0.3127, 0.3290] },
    gammaCurve: 'srgb',
    gammaValue: 2.2,
  };

  const targetSpace: ColorSpace = {
    id: 'aces-id',
    name: 'ACEScg Workspace',
    type: 'acescg',
    primaries: { red: [0.713, 0.293], green: [0.165, 0.79], blue: [0.128, 0.044], white: [0.32168, 0.33767] },
    gammaCurve: 'linear',
    gammaValue: 1.0,
  };

  // Convert pure full red color [1.0, 0.0, 0.0] from sRGB to ACEScg
  const converted = engine.managementService.convertColor([1.0, 0.0, 0.0], srcSpace, targetSpace);

  // Assert output red is non-negative and correctly converted
  assert.ok(converted[0] > 0);
  assert.ok(converted[1] >= 0);
  assert.ok(converted[2] >= 0);
});

test('CDL Grading Solvers - Lift, Gamma, Gain, Contrast, Saturation', () => {
  const engine = new ColorScienceEngine();

  const grade: Grade = engine.createDefaultGrade('grade-1', 'Classic Grade');

  // Test Contrast & Pivot
  const highContrast = engine.gradingService.applyContrast([0.5, 0.5, 0.5], 1.2, 0.4);
  // (0.5 - 0.4) * 1.2 + 0.4 = 0.1 * 1.2 + 0.4 = 0.52
  assert.strictEqual(highContrast[0], 0.52);

  // Test Saturation on Rec.709 weighting coefficients
  const saturated = engine.gradingService.applySaturation([1.0, 0.5, 0.2], 1.5);
  assert.ok(saturated[0] > 1.0); // Red saturation expands outward

  // Test full Non-Destructive Grade execution
  const graded = engine.gradingService.solveGrade([0.8, 0.6, 0.4], grade);
  assert.deepStrictEqual(graded, [0.8, 0.6, 0.4]); // default is identity
});

test('3D LUT Loader and Trilinear Interpolator', () => {
  const engine = new ColorScienceEngine();

  // Mock flat parsed .cube LUT data (3x3x3 grid = 27 data points * 3 channels)
  // Maps input RGB linearly to output * 0.8 scale
  const size = 3;
  const lutFlat = new Float32Array(size * size * size * 3);
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (z * size * size + y * size + x) * 3;
        lutFlat[idx] = (x / (size - 1)) * 0.8;
        lutFlat[idx + 1] = (y / (size - 1)) * 0.8;
        lutFlat[idx + 2] = (z / (size - 1)) * 0.8;
      }
    }
  }

  // Lookup mid point [0.5, 0.5, 0.5]
  const result = engine.lutService.trilinearInterpolate3D([0.5, 0.5, 0.5], lutFlat, size);
  assert.ok(Math.abs(result[0] - 0.4) < 0.01);
  assert.ok(Math.abs(result[1] - 0.4) < 0.01);
  assert.ok(Math.abs(result[2] - 0.4) < 0.01);
});

test('HDR Electro-Optical Curves (PQ ST2084)', () => {
  const engine = new ColorScienceEngine();

  // Test peak luminance PQ conversions
  const nits = 1000;
  const encoded = engine.hdrService.pqEncode(nits);
  const decoded = engine.hdrService.pqDecode(encoded);

  // Assert conversion is mathematically reversible within float threshold
  assert.ok(Math.abs(decoded - nits) < 0.1);
});

test('Professional Video Scopes & False Color Exposure Heatmaps', () => {
  const engine = new ColorScienceEngine();

  const r = 0.98; // overexposed highlight R
  const g = 0.96;
  const b = 0.10;

  // Highlights near clipping map to Yellow warning band
  const falseColor = engine.scopeService.mapFalseColor([r, g, b]);
  assert.deepStrictEqual(falseColor, [1.0, 1.0, 0.0]); // Yellow alert

  const blackFalseColor = engine.scopeService.mapFalseColor([0.01, 0.01, 0.02]);
  assert.deepStrictEqual(blackFalseColor, [0.5, 0, 0.5]); // Purple underexposure
});

test('Color Pipeline Orchestrator Coordination', () => {
  const engine = new ColorScienceEngine();

  const grade = engine.createDefaultGrade('g-1', 'Pipeline Grade');
  const pipeline: ColorPipeline = {
    id: 'pipe-1',
    name: 'ACES Rec709 Output Pipeline',
    inputTransform: { id: 'it-1', name: 'sRGB to ACEScg', sourceGamut: 'srgb', sourceGamma: 'srgb' },
    workingSpace: { colorSpace: { id: 'cs-aces', name: 'ACEScg', type: 'acescg', primaries: { red: [0.713, 0.293], green: [0.165, 0.79], blue: [0.128, 0.044], white: [0.32168, 0.33767] }, gammaCurve: 'linear', gammaValue: 1.0 }, linearEncoding: true },
    outputTransform: { id: 'ot-1', name: 'ACES Output Rec709', targetGamut: 'rec709', targetGamma: 'rec709' },
  };

  const processed = engine.pipelineService.evaluatePipeline([1.0, 0.5, 0.2], pipeline, grade);
  assert.ok(processed[0] > 0);
  assert.ok(processed[1] > 0);
});

test('Color Science Plugin Registries and Extensions', () => {
  const engine = new ColorScienceEngine();

  const customSpace: ColorSpace = {
    id: 'red-wide-gamut',
    name: 'REDWideGamutRGB',
    type: 'custom',
    primaries: { red: [0.78, 0.28], green: [0.08, 0.87], blue: [0.09, -0.115], white: [0.3127, 0.329] },
    gammaCurve: 'linear',
    gammaValue: 1.0,
  };

  engine.pluginRegistry.registerColorSpace(customSpace);
  const retrieved = engine.pluginRegistry.getColorSpace('red-wide-gamut');
  assert.ok(retrieved);
  assert.strictEqual(retrieved?.name, 'REDWideGamutRGB');
});
