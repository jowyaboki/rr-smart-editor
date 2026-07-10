import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';
import { TransitionInspector } from '@/features/transitions/components/TransitionInspector';

export const InspectorPanel: React.FC = () => {
  const { selectedInstanceId } = useTransitionStore();

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderLeft: '1px solid #333', overflowY: 'auto' }}>
      {selectedInstanceId ? (
        <TransitionInspector />
      ) : (
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
