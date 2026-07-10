import { useCaptionStore } from '../store/captionStore';
import { CaptionService } from '../services/CaptionService';
import { TranscriptService } from '../services/TranscriptService';
import { Transcript, CaptionTrack } from '@ai-video-editor/shared';

export const useCaptions = () => {
  const store = useCaptionStore();

  const addTrack = (name: string, transcript?: Transcript) => {
    const track = CaptionService.createTrack(name, transcript);
    store.addTrack(track);
    return track;
  };

  const importSRT = (content: string) => {
    const transcript = TranscriptService.parseSRT(content);
    return addTrack('Imported Track', transcript);
  };

  return {
    tracks: store.tracks,
    activeTrack: store.tracks.find(t => t.id === store.activeTrackId),
    selectedSegmentId: store.selectedSegmentId,
    addTrack,
    importSRT,
    updateSegment: store.updateSegment,
    setSelectedSegment: store.setSelectedSegment
  };
};
