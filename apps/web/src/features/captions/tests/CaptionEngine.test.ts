import { CaptionEngine } from '../engine/CaptionEngine';
import { CaptionService } from '../services/CaptionService';
import { Transcript } from '@ai-video-editor/shared';

export const runCaptionTests = () => {
  console.log('🚀 Starting Caption Engine Tests...');

  const mockTranscript: Transcript = {
    id: 'test-transcript',
    language: 'en',
    speakers: [],
    segments: [
      {
        id: 'seg-1',
        text: 'Hello world',
        startFrame: 0,
        endFrame: 60,
        words: [
          { id: 'w1', text: 'Hello', startFrame: 0, endFrame: 30 },
          { id: 'w2', text: 'world', startFrame: 31, endFrame: 60 }
        ]
      }
    ]
  };

  // 1. Get Active Segment
  const seg = CaptionEngine.getActiveSegment(mockTranscript, 15);
  console.log('Active segment at frame 15:', seg?.text);
  if (seg?.text !== 'Hello world') throw new Error('Segment detection failed');

  // 2. Get Active Word
  const word = CaptionEngine.getActiveWord(seg!, 15);
  console.log('Active word at frame 15:', word?.text);
  if (word?.text !== 'Hello') throw new Error('Word detection failed');

  // 3. Split Segment
  const [left, right] = CaptionService.splitSegment(seg!, 30);
  console.log(`Split: "${left.text}" and "${right.text}"`);
  if (left.endFrame !== 30 || right.startFrame !== 31) throw new Error('Split timing failed');

  console.log('✅ Caption Engine Tests Completed.');
};
