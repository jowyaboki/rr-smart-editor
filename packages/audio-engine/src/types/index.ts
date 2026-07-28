import { z } from 'zod';

// ============================================================================
// AUTOMATION CURVES
// ============================================================================

export const AutomationPointSchema = z.tuple([z.number(), z.number()]); // [frame/time, value]

export type AutomationPoint = z.infer<typeof AutomationPointSchema>;

export const AutomationCurveSchema = z.object({
  id: z.string(),
  parameterId: z.string(), // 'volume' | 'pan' | 'effect_param'
  points: z.array(AutomationPointSchema).default([[0, 1], [1000, 1]]),
  interpolation: z.enum(['linear', 'bezier', 'hold']).default('linear'),
});

export type AutomationCurve = z.infer<typeof AutomationCurveSchema>;

// ============================================================================
// AUDIO EFFECTS & CHAINS
// ============================================================================

export const AudioEffectTypeSchema = z.enum([
  'eq',
  'compressor',
  'limiter',
  'gate',
  'expander',
  'deesser',
  'reverb',
  'delay',
  'chorus',
  'flanger',
  'phaser',
  'pitch_shift',
  'time_stretch',
  'noise_reduction',
]);

export type AudioEffectType = z.infer<typeof AudioEffectTypeSchema>;

export const AudioEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: AudioEffectTypeSchema,
  enabled: z.boolean().default(true),
  parameters: z.record(z.string(), z.any()).default({}),
});

export type AudioEffect = z.infer<typeof AudioEffectSchema>;

export const AudioChainSchema = z.object({
  id: z.string(),
  effects: z.array(AudioEffectSchema).default([]),
});

export type AudioChain = z.infer<typeof AudioChainSchema>;

// ============================================================================
// MIXERS, CHANNELS, & ROUTING
// ============================================================================

export const ChannelLayoutSchema = z.enum([
  'mono',
  'stereo',
  '5.1',
  '7.1',
  'atmos',
]);

export type ChannelLayout = z.infer<typeof ChannelLayoutSchema>;

export const AudioMixerSchema = z.object({
  id: z.string(),
  faderGainDb: z.number().default(0.0), // Gain in dB (-inf to +12dB)
  pan: z.number().min(-1.0).max(1.0).default(0.0), // -1.0 Left to 1.0 Right
  solo: z.boolean().default(false),
  mute: z.boolean().default(false),
  monitor: z.boolean().default(true),
  channelLayout: ChannelLayoutSchema.default('stereo'),
});

export type AudioMixer = z.infer<typeof AudioMixerSchema>;

export const AudioBusSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['master', 'submix', 'aux_send', 'return', 'group']),
  mixer: AudioMixerSchema,
  effectChain: AudioChainSchema,
  targetBusId: z.string().optional(), // Outward routing
});

export type AudioBus = z.infer<typeof AudioBusSchema>;

export const AudioClipSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceAssetId: z.string(),
  startFrame: z.number(),
  durationFrames: z.number(),
  sourceStartOffsetFrame: z.number().default(0),
  gainMultiplier: z.number().default(1.0),
  automation: z.record(z.string(), AutomationCurveSchema).default({}),
});

export type AudioClip = z.infer<typeof AudioClipSchema>;

export const AudioTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['audio', 'instrument', 'folder']),
  mixer: AudioMixerSchema,
  effectChain: AudioChainSchema,
  clips: z.array(AudioClipSchema).default([]),
  targetBusId: z.string().default('master'), // Route directly to master or submix bus
  sendGains: z.record(z.string(), z.number()).default({}), // Bus ID -> Send Gain dB
});

export type AudioTrack = z.infer<typeof AudioTrackSchema>;

// ============================================================================
// LOUDNESS & ANALYSERS
// ============================================================================

export const LoudnessProfileSchema = z.object({
  momentaryLUFS: z.number().default(-23.0),
  shortTermLUFS: z.number().default(-23.0),
  integratedLUFS: z.number().default(-23.0),
  lra: z.number().default(0.0), // Loudness Range
  peakDb: z.number().default(-1.0),
  truePeakDb: z.number().default(-1.0),
  rmsDb: z.number().default(-10.0),
});

export type LoudnessProfile = z.infer<typeof LoudnessProfileSchema>;

export const AudioAnalysisSchema = z.object({
  spectrumDb: z.array(z.number()).default([]), // frequency distribution bands
  clippingDetected: z.boolean().default(false),
  hasDialogue: z.boolean().default(false),
  noiseFloorDb: z.number().default(-60.0),
  averageDialogueLevelLUFS: z.number().default(-23.0),
});

export type AudioAnalysis = z.infer<typeof AudioAnalysisSchema>;

export const AudioMetadataSchema = z.object({
  sampleRate: z.number().default(48000),
  bitDepth: z.number().default(24),
  channels: z.number().default(2),
  durationSeconds: z.number(),
  speakerLabels: z.array(z.string()).default([]),
});

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;

// ============================================================================
// AUDIO PROJECT
// ============================================================================

export const AudioProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  tracks: z.record(z.string(), AudioTrackSchema).default({}),
  busses: z.record(z.string(), AudioBusSchema).default({}),
  masterBus: AudioBusSchema,
  sampleRate: z.number().default(48000),
  version: z.string().default('2.0.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.any()).default({}),
  extensions: z.record(z.string(), z.any()).default({}),
});

export type AudioProject = z.infer<typeof AudioProjectSchema>;
