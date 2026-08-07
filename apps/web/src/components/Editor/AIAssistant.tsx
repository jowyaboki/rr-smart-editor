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
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Mic as VoiceIcon,
  Speed as SpeedIcon,
  Brush as ColorIcon,
  MusicNote as CleanIcon,
  PlayArrow as PlayIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useGenerateScript, useGenerateImage, useGenerateVoice } from '@/hooks/useAI';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useTimelineStore } from '../../store/useTimelineStore';
import { globalAIGeneratorService } from '../../../../../packages/ai-copilot/src/services/AIGeneratorService';
import { globalTimelineBuilderService, JobStage, GenerationJob } from '../../../../../packages/ai-copilot/src/services/TimelineBuilderService';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const { selectedContext } = useWorkflowStore();
  const addClip = useTimelineStore((state) => state.addClip);

  const scriptMutation = useGenerateScript();
  const imageMutation = useGenerateImage();
  const voiceMutation = useGenerateVoice();

  // AI Project Creator configurations (v18 Sprint)
  const [duration, setDuration] = useState(10); // Default 10s
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [style, setStyle] = useState('Cinematic Corporate');
  const [platform, setPlatform] = useState<'youtube' | 'shorts' | 'tiktok' | 'instagram'>('youtube');
  const [provider, setProvider] = useState('openai');

  // Background queue job tracking states
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState<JobStage>('idle');

  const handleCreateProject = async () => {
    if (!prompt.trim()) return;

    // Create and track job queue
    const job = globalTimelineBuilderService.createJob(prompt);
    setActiveJob(job);
    setJobStage('planning');
    setJobProgress(0);

    try {
      globalAIGeneratorService.setActiveProvider(provider);

      // Async timeline assembly tracker
      const interval = setInterval(() => {
        const currentJob = globalTimelineBuilderService.getJob(job.id);
        if (currentJob) {
          setJobProgress(currentJob.progress);
          setJobStage(currentJob.stage);
          if (currentJob.progress >= 100 || currentJob.cancelled) {
            clearInterval(interval);
            if (currentJob.progress >= 100) {
              setResult(`Successfully generated fully editable Video Project Outline! Aspect Ratio: ${aspectRatio}. Dynamic subtitle and audio tracks have been injected.`);
            }
          }
        }
      }, 200);

      await globalTimelineBuilderService.runJob(
        job.id,
        () => globalAIGeneratorService.generateProject(prompt, duration, aspectRatio, 'en', style, platform),
        addClip
      );
    } catch (err: any) {
      console.error('Job generation failed:', err);
    }
  };

  const handleCancelJob = () => {
    if (activeJob) {
      globalTimelineBuilderService.cancelJob(activeJob.id);
      setActiveJob(null);
      setJobStage('idle');
      setJobProgress(0);
      setResult('Generation task cancelled successfully.');
    }
  };

  const handleGenerateScript = async () => {
    try {
      const data = await scriptMutation.mutateAsync({ prompt });
      setResult(data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = scriptMutation.isLoading || imageMutation.isLoading || voiceMutation.isLoading || (activeJob && jobProgress < 100 && jobStage !== 'idle');
  const rawError = scriptMutation.error || imageMutation.error || voiceMutation.error;
  const error = rawError as Error | null;

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
        <AIIcon fontSize="small" color="primary" /> AI Project Creator Cockpit
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

        {/* 1. Prompt and Duration Options */}
        <TextField
          label="What video project would you like to generate?"
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A 10-second high-energy marketing promo with corporate soundtrack"
          fullWidth
          size="small"
          InputProps={{
            sx: { fontSize: '0.75rem', color: '#ffffff', bgcolor: '#0d1527' }
          }}
        />

        {/* 2. Structured Parameters Grid */}
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="ai-provider-label">AI Engine Provider</InputLabel>
              <Select
                labelId="ai-provider-label"
                value={provider}
                label="AI Engine Provider"
                onChange={(e) => setProvider(e.target.value)}
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="openai">OpenAI GPT-4o</MenuItem>
                <MenuItem value="gemini">Google Gemini Pro</MenuItem>
                <MenuItem value="anthropic">Claude 3.5 Sonnet</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="aspect-ratio-label">Aspect Ratio</InputLabel>
              <Select
                labelId="aspect-ratio-label"
                value={aspectRatio}
                label="Aspect Ratio"
                onChange={(e) => setAspectRatio(e.target.value as any)}
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="16:9">Widescreen (16:9)</MenuItem>
                <MenuItem value="9:16">Portrait (9:16)</MenuItem>
                <MenuItem value="1:1">Square (1:1)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="platform-label">Platform Target</InputLabel>
              <Select
                labelId="platform-label"
                value={platform}
                label="Platform Target"
                onChange={(e) => setPlatform(e.target.value as any)}
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="youtube">YouTube</MenuItem>
                <MenuItem value="shorts">YouTube Shorts</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Style/Mood"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ style: { fontSize: '0.75rem' } }}
            />
          </Grid>
        </Grid>

        {/* 3. Generating Trigger and Cancel Options */}
        {activeJob && jobProgress < 100 && !activeJob.cancelled ? (
          <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#050b14' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold' }}>
                Stage: {jobStage.toUpperCase()}...
              </Typography>
              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                {jobProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={jobProgress} color="primary" sx={{ height: 4, borderRadius: 2, mb: 1.5 }} />
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelJob}
              sx={{ fontSize: '0.65rem', py: 0.25 }}
            >
              Cancel Generation
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayIcon />}
            onClick={handleCreateProject}
            disabled={isLoading || !prompt.trim()}
            sx={{ fontWeight: 'bold', fontSize: '0.75rem', py: 1 }}
          >
            Prompt to Video Project Outline
          </Button>
        )}

        <Divider sx={{ borderColor: '#1b2f54', my: 1 }} />

        {/* Backward-compatible atomic options */}
        <Grid container spacing={1}>
          <Grid item xs={4}>
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
          <Grid item xs={4}>
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
          <Grid item xs={4}>
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
        </Grid>

        {isLoading && !activeJob && (
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
            <Typography variant="body2" component="div" sx={{ color: '#ffffff', fontSize: '0.78rem', lineHeight: 1.4 }}>
              {result}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default AIAssistant;
