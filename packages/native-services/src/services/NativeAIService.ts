import { INativeAIService, LocalAIConfig } from '@ai-video-editor/desktop-core';

export class NativeAIService implements INativeAIService {
  public async generateTextLocal(config: LocalAIConfig, prompt: string): Promise<string> {
    if (config.provider === 'ollama') {
      return `[Ollama - ${config.modelName}] Simulated response for: "${prompt}"`;
    } else if (config.provider === 'llamacpp') {
      return `[llama.cpp - ${config.modelName}] Local GGUF output for: "${prompt}"`;
    }
    return `[Local AI] Answer for: "${prompt}"`;
  }

  public async transcribeLocal(whisperConfig: LocalAIConfig, audioPath: string): Promise<string> {
    return `[Local Whisper Transcript] Speech decoded locally from ${audioPath}`;
  }

  public async generateEmbeddingsLocal(config: LocalAIConfig, text: string): Promise<number[]> {
    const dimensions = 128;
    const vector = new Array(dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % dimensions] = (vector[i % dimensions] + text.charCodeAt(i)) / 255;
    }
    return vector;
  }
}
