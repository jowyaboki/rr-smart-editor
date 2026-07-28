import { AudioMixerService } from './services/AudioMixerService';
import { RoutingService } from './services/RoutingService';
import { EffectChainService } from './services/EffectChainService';
import { AutomationService } from './services/AutomationService';
import { LoudnessService } from './services/LoudnessService';
import { RestorationService } from './services/RestorationService';
import { TranscriptionService } from './services/TranscriptionService';
import { AnalysisService } from './services/AnalysisService';
import { globalAudioPluginRegistry } from './registry/AudioPluginRegistry';
import { AudioProject, AudioBus, AudioTrack } from './types';

export class AudioEngine2 {
  public readonly mixerService = new AudioMixerService();
  public readonly routingService = new RoutingService();
  public readonly effectChainService = new EffectChainService();
  public readonly automationService = new AutomationService();
  public readonly loudnessService = new LoudnessService();
  public readonly restorationService = new RestorationService();
  public readonly transcriptionService = new TranscriptionService();
  public readonly analysisService = new AnalysisService();
  public readonly pluginRegistry = globalAudioPluginRegistry;

  private listeners = new Map<string, Array<(data: any) => void>>();

  /**
   * Loosely-coupled event publishing
   */
  public publish(event: string, data: any): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error executing callback for event "${event}":`, e);
        }
      });
    }
  }

  /**
   * Loosely-coupled event subscription
   */
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(event, list.filter(cb => cb !== callback));
      }
    };
  }

  /**
   * Creates a default empty AudioProject configuration
   */
  public createProject(id: string, name: string): AudioProject {
    const defaultMixer = {
      id: 'mixer-master',
      faderGainDb: 0.0,
      pan: 0.0,
      solo: false,
      mute: false,
      monitor: true,
      channelLayout: 'stereo' as any,
    };

    const masterBus: AudioBus = {
      id: 'master',
      name: 'Master Bus',
      type: 'master',
      mixer: defaultMixer,
      effectChain: { id: 'chain-master', effects: [] },
    };

    return {
      id,
      name,
      tracks: {},
      busses: {},
      masterBus,
      sampleRate: 48000,
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      extensions: {},
    };
  }
}

export const globalAudioEngine2 = new AudioEngine2();
