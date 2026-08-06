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
  Alert,
  Chip
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Mic as VoiceIcon,
  Speed as SpeedIcon,
  Brush as ColorIcon,
  MusicNote as CleanIcon
} from '@mui/icons-material';
import { useGenerateScript, useGenerateImage, useGenerateVoice } from '@/hooks/useAI';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const { selectedContext } = useWorkflowStore();

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

  // In-context editing/clean/render optimizations recommendations
  const getContextSuggestions = () => {
    if (!selectedContext) return null;
    switch (selectedContext.type) {
      case 'Video Clip':
        return {
          title: 'Color Grading Suggestions',
          desc: 'Apply cinematic Rec.709 lut shader, or use warm split tones to balance highlights.',
          actionLabel: 'Grade Clip',
          icon: <ColorIcon style={{ fontSize: '14px' }} />
        };
      case 'Audio Clip':
        return {
          title: 'Audio Cleanup Recommendations',
          desc: 'Remove low frequencies (Biquad cutoff @ 80Hz) to silence background mic rumble.',
          actionLabel: 'Clean Noise',
          icon: <CleanIcon style={{ fontSize: '14px' }} />
        };
      default:
        return {
          title: 'Render Tuning Guidelines',
          desc: 'Disable sub-frame caches to improve compilation throughput under dense tracks.',
          actionLabel: 'Optimize',
          icon: <SpeedIcon style={{ fontSize: '14px' }} />
        };
    }
  };

  const contextTip = getContextSuggestions();

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}
      >
        <AIIcon fontSize="small" color="primary" /> AI Assistant Suite
      </Typography>
      <Divider sx={{ mb: 2, borderColor: '#1b2f54' }} />

      <Stack spacing={2}>
        {/* Context-aware suggestions banner */}
        {contextTip && (
          <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: 'rgba(0, 240, 255, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {contextTip.icon}
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#00f0ff' }}>
                {contextTip.title}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5, lineHeight: 1.3 }}>
              {contextTip.desc}
            </Typography>
            <Button size="small" variant="contained" sx={{ fontSize: '0.65rem', py: 0.25, bgcolor: '#00f0ff', color: '#050b14', fontWeight: 'bold', '&:hover': { bgcolor: '#00d0f0' } }}>
              {contextTip.actionLabel}
            </Button>
          </Box>
        )}

        <TextField
          label="What are you making?"
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A 30-second promo for a futuristic coffee machine"
          fullWidth
          size="small"
          InputProps={{
            sx: { fontSize: '0.75rem', color: '#ffffff', bgcolor: '#0d1527' }
          }}
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
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AIIcon />}
              size="small"
              disabled={isLoading}
            >
              Full Video
            </Button>
          </Grid>
        </Grid>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        )}
        {error && <Alert severity="error">{error.message || 'AI Error'}</Alert>}

        {result && (
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#0d1527', borderColor: '#1b2f54' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#ffffff' }}>
              Generated Result:
            </Typography>
            <Typography variant="body2" component="div" sx={{ color: '#ffffff', fontSize: '0.78rem' }}>
              {result}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default AIAssistant;
