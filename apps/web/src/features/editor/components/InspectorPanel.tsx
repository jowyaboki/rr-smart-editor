import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';
import { useAudioStore } from '@/features/audio/store/audioStore';
import { useChartStore } from '@/features/charts/store/chartStore';
import { TransitionInspector } from '@/features/transitions/components/TransitionInspector';
import { EffectStackPanel } from '@/features/effects/components/EffectStackPanel';
import { TypographyPanel } from '@/features/text/inspector/TypographyPanel';
import { AudioInspector } from '@/features/audio/components/AudioInspector';
import { ChartInspector } from '@/features/charts/inspector/ChartInspector';

export const InspectorPanel: React.FC = () => {
  const { selectedClipId: selectedVisualClipId } = useTimelineStore();
  const { selectedInstanceId: selectedTransitionId } = useTransitionStore();
  const { selectedClipId: selectedAudioClipId } = useAudioStore();

  const visualTracks = useTimelineStore((state) => state.tracks);
  const selectedVisualClip = visualTracks.flatMap(t => t.clips).find(c => c.id === selectedVisualClipId);
  const { charts } = useChartStore();
  const hasChart = selectedVisualClip && !!charts[selectedVisualClip.id];

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderLeft: '1px solid #333', overflowY: 'auto' }}>
      {selectedTransitionId && <TransitionInspector />}

      {selectedVisualClip && (
        <>
          {selectedVisualClip.type === 'text' && <TypographyPanel clipId={selectedVisualClip.id} />}
          {hasChart && <ChartInspector clipId={selectedVisualClip.id} />}
          <Divider />
          <EffectStackPanel clipId={selectedVisualClip.id} />
        </>
      )}

      {selectedAudioClipId && (
        <AudioInspector clipId={selectedAudioClipId} />
      )}

      {!selectedTransitionId && !selectedVisualClip && !selectedAudioClipId && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1">Inspector</Typography>
          <Typography variant="body2" color="text.secondary">
            Select an element on the timeline to view its properties.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
