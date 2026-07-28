export interface TranscriptionProviderAdapter {
  id: string;
  name: string;
  transcribe(audioData: Float32Array): Promise<TranscriptionResult>;
}

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
  speakerId?: string;
  confidence: number;
}

export interface TranscriptionResult {
  fullText: string;
  words: WordTimestamp[];
}

export class TranscriptionService {
  private providers = new Map<string, TranscriptionProviderAdapter>();

  public registerProvider(provider: TranscriptionProviderAdapter): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): TranscriptionProviderAdapter | undefined {
    return this.providers.get(id);
  }

  /**
   * Automatically aligns raw subtitle word timestamps onto visual clip intervals
   */
  public alignCaptions(
    words: WordTimestamp[],
    clipStartFrame: number,
    fps: number = 30
  ): Array<{ text: string; startFrame: number; endFrame: number }> {
    const frameRate = fps;

    return words.map(w => {
      const startSec = w.startMs / 1000;
      const endSec = w.endMs / 1000;

      return {
        text: w.word,
        startFrame: clipStartFrame + Math.round(startSec * frameRate),
        endFrame: clipStartFrame + Math.round(endSec * frameRate),
      };
    });
  }
}
