import { Transcript, CaptionSegment, CaptionWord } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const TranscriptService = {
  parseSRT(content: string): Transcript {
    // Simple mock SRT parser logic
    return {
      id: uuidv4(),
      language: 'en',
      speakers: [],
      segments: []
    };
  },

  exportToVTT(transcript: Transcript): string {
    let output = 'WEBVTT\n\n';
    transcript.segments.forEach((seg, i) => {
      output += `${i + 1}\n`;
      output += `${this.formatTime(seg.startFrame)} --> ${this.formatTime(seg.endFrame)}\n`;
      output += `${seg.text}\n\n`;
    });
    return output;
  },

  private formatTime(frame: number): string {
    const totalSeconds = frame / 30; // Assuming 30fps
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
};
