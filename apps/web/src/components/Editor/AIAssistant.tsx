import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  Grid,
  Alert
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Mic as VoiceIcon
} from '@mui/icons-material';
import { useGenerateScript, useGenerateImage, useGenerateVoice } from '@/hooks/useAI';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const scriptMutation = useGenerateScript();
  const imageMutation = useGenerateImage();
  const voiceMutation = useGenerateVoice();

  const handleGenerateScript = async () => {
    try {
      const data = await scriptMutation.mutateAsync({ prompt });
      setResult(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = scriptMutation.isLoading || imageMutation.isLoading || voiceMutation.isLoading;
  const rawError = scriptMutation.error || imageMutation.error || voiceMutation.error;
  const error = rawError as Error | null;

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon fontSize="small" color="primary" /> AI Assistant
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField
          label="What are you making?"
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A 30-second promo for a futuristic coffee machine"
          fullWidth
          size="small"
        />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TextIcon />}
              size="small"
              onClick={handleGenerateScript}
              disabled={isLoading || !prompt}
            >
              Script
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ImageIcon />}
              size="small"
              disabled={isLoading || !prompt}
              onClick={() => imageMutation.mutate({ prompt })}
            >
              Images
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VoiceIcon />}
              size="small"
              disabled={isLoading || !prompt}
              onClick={() => voiceMutation.mutate({ text: prompt })}
            >
              Voice
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<AIIcon />} size="small" disabled={isLoading}>
              Full Video
            </Button>
          </Grid>
        </Grid>

        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
        {error && <Alert severity="error">{error.message || 'AI Error'}</Alert>}

        {result && (
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>Generated Result:</Typography>
            <Typography variant="body1" component="div">{result}</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default AIAssistant;
