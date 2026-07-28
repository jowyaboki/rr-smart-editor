import { z } from 'zod';

// ============================================================================
// CORE SPATIAL & TRANSFORM TYPES
// ============================================================================

export const Transform3DSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]), // [x, y, z]
  rotation: z.tuple([z.number(), z.number(), z.number()]), // [rx, ry, rz] in degrees
  scale: z.tuple([z.number(), z.number(), z.number()]), // [sx, sy, sz]
  anchorPoint: z.tuple([z.number(), z.number()]), // [ax, ay]
  opacity: z.number().min(0).max(1).default(1.0),
});

export type Transform3D = z.infer<typeof Transform3DSchema>;

// ============================================================================
// ADAPTER INTERFACES (Hardware & Rendering Independence)
// ============================================================================

export interface RenderBackend {
  id: string;
  name: string;
  initialize(canvas: any): Promise<void>;
  renderFrame(instructions: RenderInstruction): Promise<void>;
  destroy(): void;
}

export interface SceneRenderer {
  id: string;
  renderBackend: RenderBackend;
  compositeLayers(layers: CompositeLayer[]): Promise<any>;
}

export interface CameraAdapter {
  id: string;
  name: string;
  getTransform(): Transform3D;
  setLensPreset(presetName: string): void;
  setDepthOfField(config: { enabled: boolean; aperture: number; focusDistance: number }): void;
}

export interface EnvironmentAdapter {
  id: string;
  name: string;
  loadHDRI(url: string): Promise<void>;
  setBackground360(url: string): Promise<void>;
  setProceduralParams(params: Record<string, any>): void;
}

export interface TrackingAdapter {
  id: string;
  name: string;
  type: 'camera' | 'marker' | 'motion' | 'object';
  startTracking(): Promise<void>;
  stopTracking(): Promise<void>;
  getLatestFrameData(): Promise<TrackingFrameData>;
}

export interface MocapAdapter {
  id: string;
  name: string;
  type: 'body' | 'face' | 'hand' | 'eye';
  getMocapData(): Promise<MocapFrameData>;
  retargetToRig(rigId: string, data: MocapFrameData): any;
}

export interface IRenderInstructionBuilder {
  build(studio: VirtualStudio): RenderInstruction;
}

// ============================================================================
// DATA TRANSFERS & ADAPTER SCHEMAS
// ============================================================================

export interface TrackingFrameData {
  timestamp: number;
  position: [number, number, number];
  rotation: [number, number, number];
  confidence: number;
  quality?: string;
}

export interface MocapFrameData {
  timestamp: number;
  type: 'body' | 'face' | 'hand' | 'eye';
  joints: Record<string, [number, number, number]>; // Joint Name -> Position
  expressions?: Record<string, number>; // Expression -> Blendshape value (0-1)
}

// ============================================================================
// LENS & CAMERA PROPERTIES
// ============================================================================

export const LensPresetSchema = z.enum([
  'custom',
  '18mm_wide',
  '24mm_landscape',
  '35mm_street',
  '50mm_standard',
  '85mm_portrait',
  '135mm_telephoto',
  '200mm_super_tele',
]);

export type LensPreset = z.infer<typeof LensPresetSchema>;

export const DepthOfFieldSchema = z.object({
  enabled: z.boolean().default(false),
  aperture: z.number().min(0.7).max(32).default(2.8), // f-stop
  focusDistance: z.number().min(0).default(5.0), // in meters
  bladeCount: z.number().min(3).max(12).default(9),
});

export type DepthOfField = z.infer<typeof DepthOfFieldSchema>;

export const CameraBookmarkSchema = z.object({
  id: z.string(),
  name: z.string(),
  transform: Transform3DSchema,
  focalLength: z.number(),
  timestamp: z.number(),
});

export type CameraBookmark = z.infer<typeof CameraBookmarkSchema>;

// ============================================================================
// CAMERAS & CAMERA RIGS
// ============================================================================

export const CameraTypeSchema = z.enum([
  'perspective',
  'orthographic',
  'dolly',
  'crane',
  'orbit',
  'handheld',
]);

export type CameraType = z.infer<typeof CameraTypeSchema>;

export const VirtualCameraSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: CameraTypeSchema,
  transform: Transform3DSchema,
  projection: z.enum(['perspective', 'orthographic']).default('perspective'),
  fov: z.number().min(1).max(179).default(60),
  focalLength: z.number().min(1).default(50), // in mm
  lensPreset: LensPresetSchema.default('50mm_standard'),
  depthOfField: DepthOfFieldSchema,
  bookmarks: z.array(CameraBookmarkSchema).default([]),
  activeBookmarkId: z.string().optional(),
});

export type VirtualCamera = z.infer<typeof VirtualCameraSchema>;

export const CameraRigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['static', 'dolly_track', 'crane_arm', 'orbit_arm', 'handheld_rig']),
  transform: Transform3DSchema,
  activeCameraId: z.string(),
  constraints: z.object({
    trackLength: z.number().optional(), // for dolly
    armLength: z.number().optional(), // for crane
    orbitRadius: z.number().optional(), // for orbit
    handheldJitter: z.number().optional(), // for handheld
  }),
});

export type CameraRig = z.infer<typeof CameraRigSchema>;

// ============================================================================
// LIGHTING
// ============================================================================

export const LightTypeSchema = z.enum(['directional', 'point', 'spot', 'area']);

export type LightType = z.infer<typeof LightTypeSchema>;

export const LightRigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: LightTypeSchema,
  transform: Transform3DSchema,
  color: z.string().default('#ffffff'), // Hex color string
  intensity: z.number().min(0).default(1.0),
  temperature: z.number().min(1000).max(40000).default(6500), // in Kelvin
  shadows: z.object({
    enabled: z.boolean().default(true),
    bias: z.number().default(0.005),
    radius: z.number().default(4), // blur shadow edge
    resolution: z.number().default(2048), // shadow map resolution
  }),
  spotAngle: z.number().min(0).max(180).optional(), // for Spot lights
  spotPenumbra: z.number().min(0).max(1).optional(), // Spot blur
  areaSize: z.tuple([z.number(), z.number()]).optional(), // [width, height] for Area lights
  groupName: z.string().default('default-group'),
});

export type LightRig = z.infer<typeof LightRigSchema>;

// ============================================================================
// ENVIRONMENTS
// ============================================================================

export const EnvironmentTypeSchema = z.enum([
  'hdri',
  'skybox_360',
  'image_backplate',
  'video_feed',
  'procedural',
]);

export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;

export const EnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: EnvironmentTypeSchema,
  sourceUrl: z.string().optional(),
  proceduralParams: z.record(z.string(), z.any()).default({}),
  exposure: z.number().default(1.0),
  blurAmount: z.number().min(0).max(1).default(0.0),
  rotationY: z.number().default(0.0), // rotate HDRI background
});

export type Environment = z.infer<typeof EnvironmentSchema>;

// ============================================================================
// HARDWARE TRACKING & LATENCY CALIBRATION
// ============================================================================

export const TrackingSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['camera_tracker', 'marker_tracker', 'motion_sensor', 'object_tag']),
  adapterId: z.string().optional(),
  delayMs: z.number().default(0), // latency compensation
  noiseFilterCutoff: z.number().default(1.5), // low pass filtering cut-off
  coordinateMapping: z.object({
    axesSwap: z.record(z.string(), z.string()).optional(),
    scale: z.tuple([z.number(), z.number(), z.number()]).default([1, 1, 1]),
    offset: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  }),
});

export type TrackingSource = z.infer<typeof TrackingSourceSchema>;

export const CalibrationProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  lensDistortion: z.object({
    k1: z.number().default(0), // Radial distortion k1
    k2: z.number().default(0), // Radial distortion k2
    p1: z.number().default(0), // Tangential distortion p1
    p2: z.number().default(0), // Tangential distortion p2
    fx: z.number().default(1000), // focal length fx
    fy: z.number().default(1000), // focal length fy
    cx: z.number().default(960), // center cx
    cy: z.number().default(540), // center cy
  }),
  trackingOffset: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
    rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  }),
  latencyAlignmentMs: z.number().default(0),
  timestamp: z.number(),
});

export type CalibrationProfile = z.infer<typeof CalibrationProfileSchema>;

// ============================================================================
// COMPOSITING & LAYERING
// ============================================================================

export const ChromaKeySettingsSchema = z.object({
  keyColor: z.string().default('#00ff00'),
  tolerance: z.number().min(0).max(1).default(0.4),
  edgeFeather: z.number().min(0).default(0),
  spillReduction: z.number().min(0).max(1).default(0.5),
});

export type ChromaKeySettings = z.infer<typeof ChromaKeySettingsSchema>;

export const LumaKeySettingsSchema = z.object({
  threshold: z.number().min(0).max(1).default(0.5),
  tolerance: z.number().min(0).max(1).default(0.1),
  invert: z.boolean().default(false),
});

export type LumaKeySettings = z.infer<typeof LumaKeySettingsSchema>;

export const KeyingTypeSchema = z.enum([
  'none',
  'chroma_green_screen',
  'chroma_custom',
  'luma',
  'alpha_channel',
]);

export type KeyingType = z.infer<typeof KeyingTypeSchema>;

export const CompositeLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceId: z.string(), // clip or asset reference
  order: z.number(),
  visible: z.boolean().default(true),
  opacity: z.number().min(0).max(1).default(1.0),
  blendMode: z.string().default('normal'),
  keying: z.object({
    type: KeyingTypeSchema,
    chroma: ChromaKeySettingsSchema,
    luma: LumaKeySettingsSchema,
  }),
  transform3d: Transform3DSchema,
  isVirtualSetBackground: z.boolean().default(false),
});

export type CompositeLayer = z.infer<typeof CompositeLayerSchema>;

export const VirtualSetSchema = z.object({
  id: z.string(),
  name: z.string(),
  activeEnvironmentId: z.string(),
  activeCameraId: z.string(),
  layers: z.array(CompositeLayerSchema).default([]),
  scaleFactor: z.number().default(1.0),
});

export type VirtualSet = z.infer<typeof VirtualSetSchema>;

// ============================================================================
// VIRTUAL STUDIO & STAGES
// ============================================================================

export const StageSchema = z.object({
  id: z.string(),
  name: z.string(),
  dimensions: z.tuple([z.number(), z.number(), z.number()]), // [width, depth, height] in meters
  gridSize: z.number().default(1.0), // grid snapping increment
  originOffset: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  calibrationProfileId: z.string().optional(),
});

export type Stage = z.infer<typeof StageSchema>;

export const VirtualStudioSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: StageSchema,
  cameraRigs: z.record(z.string(), CameraRigSchema).default({}),
  cameras: z.record(z.string(), VirtualCameraSchema).default({}),
  lightRigs: z.record(z.string(), LightRigSchema).default({}),
  environments: z.record(z.string(), EnvironmentSchema).default({}),
  trackingSources: z.record(z.string(), TrackingSourceSchema).default({}),
  calibrationProfiles: z.record(z.string(), CalibrationProfileSchema).default({}),
  virtualSets: z.record(z.string(), VirtualSetSchema).default({}),
  activeVirtualSetId: z.string().optional(),
  version: z.string().default('1.0.0'),
  metadata: z.record(z.string(), z.any()).default({}),
});

export type VirtualStudio = z.infer<typeof VirtualStudioSchema>;

// ============================================================================
// RENDER PIPELINE INSTRUCTIONS
// ============================================================================

export interface RenderInstruction {
  studioId: string;
  timestamp: number;
  viewportWidth: number;
  viewportHeight: number;
  camera: {
    type: CameraType;
    transform: Transform3D;
    projection: 'perspective' | 'orthographic';
    fov: number;
    focalLength: number;
    depthOfField: DepthOfField;
  };
  environment: {
    type: EnvironmentType;
    sourceUrl?: string;
    exposure: number;
    blurAmount: number;
    rotationY: number;
    proceduralParams: Record<string, any>;
  };
  lights: Array<{
    id: string;
    type: LightType;
    transform: Transform3D;
    color: string;
    intensity: number;
    shadows: {
      enabled: boolean;
      bias: number;
      radius: number;
    };
  }>;
  layers: Array<{
    id: string;
    sourceId: string;
    order: number;
    opacity: number;
    blendMode: string;
    keying: {
      type: KeyingType;
      chroma: ChromaKeySettings;
      luma: LumaKeySettings;
    };
    transform3d: Transform3D;
  }>;
}
