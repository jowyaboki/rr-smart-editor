import { AudioEffect, AudioBus } from '../types';

export interface AudioPluginEffect {
  id: string;
  name: string;
  type: string;
  process(buffer: Float32Array): Promise<Float32Array>;
}

export interface AudioAnalyzerPlugin {
  id: string;
  name: string;
  analyze(buffer: Float32Array): Promise<any>;
}

export class AudioPluginRegistry {
  private customEffects = new Map<string, AudioPluginEffect>();
  private analyzers = new Map<string, AudioAnalyzerPlugin>();
  private mixPresets = new Map<string, any>();

  public registerAudioEffect(effect: AudioPluginEffect): void {
    this.customEffects.set(effect.id, effect);
  }

  public getAudioEffect(id: string): AudioPluginEffect | undefined {
    return this.customEffects.get(id);
  }

  public listAudioEffects(): AudioPluginEffect[] {
    return Array.from(this.customEffects.values());
  }

  public registerAnalyzer(analyzer: AudioAnalyzerPlugin): void {
    this.analyzers.set(analyzer.id, analyzer);
  }

  public getAnalyzer(id: string): AudioAnalyzerPlugin | undefined {
    return this.analyzers.get(id);
  }

  public listAnalyzers(): AudioAnalyzerPlugin[] {
    return Array.from(this.analyzers.values());
  }

  public registerMixPreset(id: string, preset: any): void {
    this.mixPresets.set(id, preset);
  }

  public getMixPreset(id: string): any {
    return this.mixPresets.get(id);
  }

  public clear(): void {
    this.customEffects.clear();
    this.analyzers.clear();
    this.mixPresets.clear();
  }
}

export const globalAudioPluginRegistry = new AudioPluginRegistry();
