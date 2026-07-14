import { CaptionTrack, CaptionSegment, Transcript } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const CaptionService = {
  createTrack(name: string, transcript?: Transcript): CaptionTrack {
    return {
      id: uuidv4(),
      name,
      transcript: transcript || { id: uuidv4(), segments: [], language: 'en', speakers: [] },
      styleId: 'default-caption-style',
      isEnabled: true
    };
  },

  splitSegment(segment: CaptionSegment, atFrame: number): [CaptionSegment, CaptionSegment] {
    const leftWords = segment.words.filter(w => w.endFrame <= atFrame);
    const rightWords = segment.words.filter(w => w.startFrame > atFrame);

    return [
      { ...segment, id: uuidv4(), words: leftWords, endFrame: atFrame, text: leftWords.map(w => w.text).join(' ') },
      { ...segment, id: uuidv4(), words: rightWords, startFrame: atFrame + 1, text: rightWords.map(w => w.text).join(' ') }
    ];
  }
};
