import { CaptionSegment, CaptionWord, Transcript } from '@ai-video-editor/shared';

export const CaptionEngine = {
  getActiveSegment(transcript: Transcript, frame: number): CaptionSegment | null {
    return transcript.segments.find(
      seg => frame >= seg.startFrame && frame <= seg.endFrame
    ) || null;
  },

  getActiveWord(segment: CaptionSegment, frame: number): CaptionWord | null {
    return segment.words.find(
      word => frame >= word.startFrame && frame <= word.endFrame
    ) || null;
  },

  getWordProgress(word: CaptionWord, frame: number): number {
    const duration = word.endFrame - word.startFrame;
    if (duration <= 0) return 1;
    return Math.max(0, Math.min(1, (frame - word.startFrame) / duration));
  }
};
