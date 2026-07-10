import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  IconButton
} from '@mui/material';
import { AccessTime as TimeIcon, Person as SpeakerIcon } from '@mui/icons-material';
import { useCaptionStore } from '../store/captionStore';

interface WordEditorProps {
  segmentId: string;
}

export const WordEditor: React.FC<WordEditorProps> = ({ segmentId }) => {
  const { tracks, activeTrackId, updateWord } = useCaptionStore();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const segment = activeTrack?.transcript.segments.find(s => s.id === segmentId);

  if (!segment) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Segment Editor</Typography>
      <TextField
        fullWidth
        multiline
        label="Full Text"
        value={segment.text}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle2" gutterBottom>Words & Timing</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {segment.words.map((word) => (
          <Paper key={word.id} sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid #444' }}>
            <TextField
              variant="standard"
              value={word.text}
              onChange={(e) => updateWord(activeTrackId!, segmentId, word.id, { text: e.target.value })}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {word.startFrame} - {word.endFrame}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
