import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';
import { TransitionInspector } from '@/features/transitions/components/TransitionInspector';
import { EffectStackPanel } from '@/features/effects/components/EffectStackPanel';
import { TypographyPanel } from '@/features/text/inspector/TypographyPanel';

export const InspectorPanel: React.FC = () => {
  const { selectedClipId } = useTimelineStore();
  const { selectedInstanceId: selectedTransitionId } = useTransitionStore();

  const tracks = useTimelineStore((state) => state.tracks);
  const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderLeft: '1px solid #333', overflowY: 'auto' }}>
      {selectedTransitionId && <TransitionInspector />}

      {selectedClip && (
        <>
          {selectedClip.type === 'text' && <TypographyPanel clipId={selectedClip.id} />}
          <Divider />
          <EffectStackPanel clipId={selectedClip.id} />
        </>
      )}

      {!selectedTransitionId && !selectedClip && (
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
