import { z } from 'zod';

// ============================================================================
// CORE CHROMATICITIES & TRISTIMULUS MATHEMATICS
// ============================================================================

export const ColorSpaceTypeSchema = z.enum([
  'srgb',
  'display_p3',
  'rec709',
  'rec2020',
  'acescg',
  'aces2065_1',
  'linear',
  'custom',
]);

export type ColorSpaceType = z.infer<typeof ColorSpaceTypeSchema>;

export const ChromaticityPrimariesSchema = z.object({
  red: z.tuple([z.number(), z.number()]),   // [x, y]
  green: z.tuple([z.number(), z.number()]), // [x, y]
  blue: z.tuple([z.number(), z.number()]),  // [x, y]
  white: z.tuple([z.number(), z.number()]), // [x, y] (white point chromaticity)
});

export type ChromaticityPrimaries = z.infer<typeof ChromaticityPrimariesSchema>;

export const ColorSpaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ColorSpaceTypeSchema,
  primaries: ChromaticityPrimariesSchema,
  gammaCurve: z.enum(['srgb', 'bt1886', 'linear', 'pq', 'hlg', 'custom']).default('linear'),
  gammaValue: z.number().default(1.0),
});

export type ColorSpace = z.infer<typeof ColorSpaceSchema>;

export const WorkingColorSpaceSchema = z.object({
  colorSpace: ColorSpaceSchema,
  linearEncoding: z.boolean().default(true),
});

export type WorkingColorSpace = z.infer<typeof WorkingColorSpaceSchema>;

// ============================================================================
// DISPLAY & CALIBRATION PROFILES
// ============================================================================

export const DisplayProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetGamut: ColorSpaceTypeSchema,
  peakLuminanceNits: z.number().default(100),
  iccProfileUrl: z.string().optional(),
});

export type DisplayProfile = z.infer<typeof DisplayProfileSchema>;

export const CalibrationProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  monitorId: z.string(),
  measuredWhitePoint: z.tuple([z.number(), z.number(), z.number()]), // [X, Y, Z] or [R, G, B] multipliers
  measuredBlackPoint: z.tuple([z.number(), z.number(), z.number()]),
  gammaResponse: z.number().default(2.4),
  calibrationTarget: z.enum(['rec709_d65', 'dci_p3_d65', 'rec2020_d65']).default('rec709_d65'),
  timestamp: z.number(),
});

export type CalibrationProfile = z.infer<typeof CalibrationProfileSchema>;

// ============================================================================
// LUT SUPPORT TYPES
// ============================================================================

export const LUTTypeSchema = z.enum(['1d', '3d']);

export type LUTType = z.infer<typeof LUTTypeSchema>;

export const LUTSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: LUTTypeSchema,
  size: z.number(), // Grid size (e.g. 33 for 33x33x33)
  contentUrl: z.string().optional(),
  title: z.string().optional(),
  inputRange: z.tuple([z.number(), z.number()]).default([0, 1]),
  outputRange: z.tuple([z.number(), z.number()]).default([0, 1]),
});

export type LUT = z.infer<typeof LUTSchema>;

export interface LUT1DData {
  size: number;
  red: Float32Array;
  green: Float32Array;
  blue: Float32Array;
}

export interface LUT3DData {
  size: number;
  data: Float32Array; // Size^3 * 3 flat layout
}

// ============================================================================
// HDR CONFIGURATION TYPES
// ============================================================================

export const HDRProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  encoding: z.enum(['hdr10', 'hlg', 'pq', 'sdr']).default('sdr'),
  maxCLLNits: z.number().default(1000),  // Max Content Light Level
  maxFALLNits: z.number().default(400),   // Max Frame-Average Light Level
  peakLuminanceNits: z.number().default(1000),
  toneMappingAlgorithm: z.enum(['aces_reinhard', 'filmic', 'linear', 'hable']).default('aces_reinhard'),
});

export type HDRProfile = z.infer<typeof HDRProfileSchema>;

// ============================================================================
// NON-DESTRUCTIVE COLOR GRADING (ASC CDL + ADVANCED)
// ============================================================================

export const ColorWheelValueSchema = z.object({
  rgb: z.tuple([z.number(), z.number(), z.number()]).default([1, 1, 1]),
  luminance: z.number().default(0),
});

export type ColorWheelValue = z.infer<typeof ColorWheelValueSchema>;

export const CurvePointSchema = z.tuple([z.number(), z.number()]); // [x, y]

export type CurvePoint = z.infer<typeof CurvePointSchema>;

export const ColorCurvesSchema = z.object({
  master: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  red: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  green: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  blue: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  hueVsHue: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  hueVsSat: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
  hueVsLum: z.array(CurvePointSchema).default([[0, 0], [1, 1]]),
});

export type ColorCurves = z.infer<typeof ColorCurvesSchema>;

export const GradeSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ASC CDL standard params
  lift: ColorWheelValueSchema,  // darks
  gamma: ColorWheelValueSchema, // midtones
  gain: ColorWheelValueSchema,  // highlights
  offset: ColorWheelValueSchema, // master absolute offset
  // Creative controls
  contrast: z.number().min(0).max(3).default(1.0),
  pivot: z.number().min(0).max(1).default(0.435), // pivot point for contrast curve
  saturation: z.number().min(0).max(3).default(1.0),
  temperature: z.number().min(-100).max(100).default(0), // amber-blue shift
  tint: z.number().min(-100).max(100).default(0),        // green-magenta shift
  rgbMixer: z.object({
    red: z.tuple([z.number(), z.number(), z.number()]).default([1, 0, 0]),   // input multipliers
    green: z.tuple([z.number(), z.number(), z.number()]).default([0, 1, 0]),
    blue: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 1]),
  }),
  curves: ColorCurvesSchema,
  logWheels: z.object({
    shadows: ColorWheelValueSchema,
    midtones: ColorWheelValueSchema,
    highlights: ColorWheelValueSchema,
    shadowLimit: z.number().default(0.18),
    highlightLimit: z.number().default(0.55),
  }),
  schemaVersion: z.string().default('1.0.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.any()).default({}),
  extensions: z.record(z.string(), z.any()).default({}),
});

export type Grade = z.infer<typeof GradeSchema>;

// ============================================================================
// TRANSFORMS & METADATA
// ============================================================================

export const InputTransformSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceGamut: ColorSpaceTypeSchema,
  sourceGamma: z.string(), // S-Log3, LogC3, LogC4, linear, srgb
});

export type InputTransform = z.infer<typeof InputTransformSchema>;

export const OutputTransformSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetGamut: ColorSpaceTypeSchema,
  targetGamma: z.string(), // srgb, bt1886, linear, pq, hlg
});

export type OutputTransform = z.infer<typeof OutputTransformSchema>;

export const LookTransformSchema = z.object({
  id: z.string(),
  name: z.string(),
  lookLutId: z.string().optional(),
  intensity: z.number().min(0).max(1).default(1.0),
});

export type LookTransform = z.infer<typeof LookTransformSchema>;

export const ColorMetadataSchema = z.object({
  cameraManufacturer: z.string().optional(),
  cameraModel: z.string().optional(),
  logFormat: z.string().optional(),
  iso: z.number().optional(),
  whiteBalanceKelvin: z.number().optional(),
  colorSpace: ColorSpaceTypeSchema.optional(),
});

export type ColorMetadata = z.infer<typeof ColorMetadataSchema>;

// ============================================================================
// PIPELINE & INSTRUCTIONS
// ============================================================================

export const ColorPipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  inputTransform: InputTransformSchema,
  workingSpace: WorkingColorSpaceSchema,
  lookTransform: LookTransformSchema.optional(),
  outputTransform: OutputTransformSchema,
  hdrProfile: HDRProfileSchema.optional(),
});

export type ColorPipeline = z.infer<typeof ColorPipelineSchema>;

export interface ColorTransformInstruction {
  pipelineId: string;
  sourceSpace: ColorSpace;
  workingSpace: ColorSpace;
  outputSpace: ColorSpace;
  hasLUT: boolean;
  lutSize?: number;
  grade: Grade;
}
