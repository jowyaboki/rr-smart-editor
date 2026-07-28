import test from 'node:test';
import assert from 'node:assert';
import { AudioEngine2 } from '../AudioEngine2';
import { AudioProject, AutomationCurve } from '../types';

test('Audio Mixer - DB Fader Gain & Constant-Power Stereo Panning', () => {
  const engine = new AudioEngine2();

  // dB to linear multiplier fader
  assert.strictEqual(engine.mixerService.dbToLinear(0.0), 1.0);
  assert.strictEqual(engine.mixerService.dbToLinear(-6.020599913279624), 0.5); // half volume

  // Constant-power panning coefficients
  const leftPan = engine.mixerService.calculateStereoPan(-1.0); // Hard Left
  assert.strictEqual(leftPan[0], 1.0);
  assert.strictEqual(leftPan[1], 0.0);

  const centerPan = engine.mixerService.calculateStereoPan(0.0); // Center
  assert.ok(Math.abs(centerPan[0] - Math.sqrt(0.5)) < 0.01);
  assert.ok(Math.abs(centerPan[1] - Math.sqrt(0.5)) < 0.01);
});

test('Bus Routing Loops - Cyclic Routing Feedback Detection', () => {
  const engine = new AudioEngine2();
  const project = engine.createProject('proj-1', 'Test Project');

  project.tracks['track-1'] = {
    id: 'track-1',
    name: 'Voice',
    type: 'audio',
    mixer: { id: 'm-1', faderGainDb: 0, pan: 0, solo: false, mute: false, monitor: true, channelLayout: 'stereo' },
    effectChain: { id: 'ec-1', effects: [] },
    clips: [],
    targetBusId: 'bus-aux-a',
    sendGains: {},
  };

  project.busses['bus-aux-a'] = {
    id: 'bus-aux-a',
    name: 'Bus A',
    type: 'submix',
    mixer: { id: 'm-a', faderGainDb: 0, pan: 0, solo: false, mute: false, monitor: true, channelLayout: 'stereo' },
    effectChain: { id: 'ec-a', effects: [] },
    targetBusId: 'bus-aux-b',
  };

  project.busses['bus-aux-b'] = {
    id: 'bus-aux-b',
    name: 'Bus B',
    type: 'submix',
    mixer: { id: 'm-b', faderGainDb: 0, pan: 0, solo: false, mute: false, monitor: true, channelLayout: 'stereo' },
    effectChain: { id: 'ec-b', effects: [] },
    targetBusId: 'bus-aux-a', // Cyclic loop feedback!
  };

  // Assert resolving routing path triggers a cyclic feedback error safely
  assert.throws(() => {
    engine.routingService.resolveRoutingPath(project, 'track-1');
  }, /feedback loop/);
});

test('Automation Curves - Linear and Bezier Spline Keyframe Interpolations', () => {
  const engine = new AudioEngine2();

  const curve: AutomationCurve = {
    id: 'curve-volume',
    parameterId: 'volume',
    points: [[100, 0.0], [200, 1.0]],
    interpolation: 'linear',
  };

  // Mid point 150 -> value should be 0.5
  const midVal = engine.automationService.evaluateCurve(curve, 150);
  assert.strictEqual(midVal, 0.5);

  // Out of bounds
  assert.strictEqual(engine.automationService.evaluateCurve(curve, 50), 0.0);
  assert.strictEqual(engine.automationService.evaluateCurve(curve, 250), 1.0);

  // Bezier quadratic interpolation
  curve.interpolation = 'bezier';
  const bezierVal = engine.automationService.evaluateCurve(curve, 150);
  assert.strictEqual(bezierVal, 0.5); // symmetric middle point is identical
});

test('EBU R128 Loudness and Normalization Gain Factors', () => {
  const engine = new AudioEngine2();

  const buffer = new Float32Array(48000); // 1 sec of pure silence
  const rms = engine.loudnessService.calculateRMS(buffer);
  assert.strictEqual(rms, -120);

  // Streaming normalizations target LUFS to linear gain
  const factor = engine.loudnessService.getNormalizationGainMultiplier(-20.0, -14.0);
  assert.ok(Math.abs(factor - 2.0) < 0.01); // +6dB maps to factor 2
});

test('Audio Restoration - Dialogue Silence Detection Trimmer', () => {
  const engine = new AudioEngine2();

  // Create block with silence, noise segment, then silence
  const buffer = new Float32Array(48000 * 2); // 2 secs
  for (let i = 24000; i < 48000; i++) {
    buffer[i] = 0.5; // active dialogue spike
  }

  const silenceSegments = engine.restorationService.detectSilence(buffer, -40.0);
  assert.ok(silenceSegments.length > 0);
  assert.strictEqual(silenceSegments[0].startFrame, 0);
});

test('Transcription Provider Adapters and Caption Alignment', () => {
  const engine = new AudioEngine2();

  const words = [
    { word: 'Hello', startMs: 500, endMs: 800, confidence: 0.99 },
    { word: 'World', startMs: 900, endMs: 1400, confidence: 0.98 },
  ];

  const captions = engine.transcriptionService.alignCaptions(words, 100, 30);
  assert.strictEqual(captions.length, 2);
  assert.strictEqual(captions[0].text, 'Hello');
  assert.strictEqual(captions[0].startFrame, 100 + 15); // 0.5 sec * 30fps = 15 frames offset
});

test('Transient Detection & Clipping Warnings', () => {
  const engine = new AudioEngine2();

  const buffer = new Float32Array(1000);
  buffer[50] = 1.0; // digital clipping alert trigger

  const isClipping = engine.analysisService.detectClipping(buffer);
  assert.strictEqual(isClipping, true);
});

test('Audio Plugin Registry and Preset validations', () => {
  const engine = new AudioEngine2();

  const mockPlugin: any = {
    id: 'vocal-rider',
    name: 'AI Vocal Rider',
    type: 'compressor',
    process: async (b: Float32Array) => b,
  };

  engine.pluginRegistry.registerAudioEffect(mockPlugin);
  const retrieved = engine.pluginRegistry.getAudioEffect('vocal-rider');
  assert.ok(retrieved);
  assert.strictEqual(retrieved?.name, 'AI Vocal Rider');
});
