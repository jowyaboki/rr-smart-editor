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
  LinearProgress,
  Tooltip
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
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Refresh as RegenerateIcon
} from '@mui/icons-material';
import { useGenerateScript, useGenerateImage, useGenerateVoice } from '@/hooks/useAI';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useTimelineStore } from '../../store/useTimelineStore';
import { globalAIGeneratorService } from '../../../../../packages/ai-copilot/src/services/AIGeneratorService';
import { globalTimelineBuilderService, JobStage, GenerationJob } from '../../../../../packages/ai-copilot/src/services/TimelineBuilderService';
import { globalAIAgentOrchestrationService, ProductionArtifact } from '../../../../../packages/ai-copilot/src/services/AIAgentOrchestrationService';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const { selectedContext } = useWorkflowStore();
  const addClip = useTimelineStore((state) => state.addClip);

  const scriptMutation = useGenerateScript();
  const imageMutation = useGenerateImage();
  const voiceMutation = useGenerateVoice();

  // Multi-Agent Production Brief parameters (v18 Sprint)
  const [duration, setDuration] = useState(10); // Default 10s
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [style, setStyle] = useState('Cinematic Corporate');
  const [platform, setPlatform] = useState<'youtube' | 'shorts' | 'tiktok' | 'instagram'>('youtube');
  const [provider, setProvider] = useState('openai');
  const [brand, setBrand] = useState('Acme Corporation');
  const [tone, setTone] = useState('Inspiring');
  const [audience, setAudience] = useState('Creators & Developers');

  // Background queue job tracking states
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStage, setJobStage] = useState<JobStage>('idle');

  // Multi-Agent Artifact Pipeline states
  const [artifacts, setArtifacts] = useState<ProductionArtifact[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const agents = globalAIAgentOrchestrationService.getAgents();

  const handleRunMultiAgentPipeline = async () => {
    if (!prompt.trim()) return;
    setIsOrchestrating(true);
    setResult(null);

    // Simulate multi-agent chronological task execution progress
    setTimeout(async () => {
      const compiledArtifacts = await globalAIAgentOrchestrationService.runOrchestrationPipeline({
        creativeObjective: prompt,
        platform,
        duration,
        brand,
        audience,
        tone,
        language: 'en',
        visualStyle: style
      });
      setArtifacts(compiledArtifacts);
      setIsOrchestrating(false);
    }, 1500);
  };

  const handleApproveArtifact = (id: string) => {
    globalAIAgentOrchestrationService.approveArtifact(id);
    setArtifacts([...globalAIAgentOrchestrationService.getArtifacts()]);
  };

  const handleRejectArtifact = (id: string) => {
    globalAIAgentOrchestrationService.rejectArtifact(id);
    setArtifacts([...globalAIAgentOrchestrationService.getArtifacts()]);
  };

  const handleImportToEditor = async () => {
    // Collect and compile approved artifacts into the timeline builder
    const job = globalTimelineBuilderService.createJob(prompt);
    setActiveJob(job);
    setJobStage('planning');
    setJobProgress(0);

    try {
      globalAIGeneratorService.setActiveProvider(provider);

      const interval = setInterval(() => {
        const currentJob = globalTimelineBuilderService.getJob(job.id);
        if (currentJob) {
          setJobProgress(currentJob.progress);
          setJobStage(currentJob.stage);
          if (currentJob.progress >= 100 || currentJob.cancelled) {
            clearInterval(interval);
            if (currentJob.progress >= 100) {
              setResult(`Successfully generated fully editable Video Project Outline! Aspect Ratio: ${aspectRatio}. Subtitle and audio tracks have been injected.`);
              setActiveJob(null);
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

  const isLoading = scriptMutation.isLoading || imageMutation.isLoading || voiceMutation.isLoading || isOrchestrating || (activeJob && jobProgress < 100 && jobStage !== 'idle');
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
        <AIIcon fontSize="small" color="primary" /> AI Multi-Agent Production Workspace
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

        {/* Phase 6 Active Agents grid */}
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#0d1527', borderColor: '#1b2f54' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
            Production Crew (Specialized Agents)
          </Typography>
          <Grid container spacing={1}>
            {agents.map((agent) => (
              <Grid item xs={4} key={agent.id}>
                <Tooltip title={agent.role}>
                  <Box sx={{ p: 1, bgcolor: '#050b14', border: '1px solid #1b2f54', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#00f0ff' } }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.25 }}>{agent.avatar}</Typography>
                    <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.58rem', fontWeight: 'bold', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {agent.name.split(' ')[0]}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Phase 7 Production Brief */}
        <TextField
          label="Creative Objective Prompt"
          multiline
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A 10-second high-energy marketing promo with corporate soundtrack"
          fullWidth
          size="small"
          InputProps={{
            sx: { fontSize: '0.75rem', color: '#ffffff', bgcolor: '#0d1527' }
          }}
        />

        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <TextField
              label="Brand / Style"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ style: { fontSize: '0.75rem' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Target Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ style: { fontSize: '0.75rem' } }}
            />
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
        </Grid>

        {isOrchestrating ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}>
            <CircularProgress size={24} color="primary" />
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Sarah and Michael are compiling scripts...</Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayIcon />}
            onClick={handleRunMultiAgentPipeline}
            disabled={isLoading || !prompt.trim()}
            sx={{ fontWeight: 'bold', fontSize: '0.75rem', py: 1 }}
          >
            Orchestrate Production Crew
          </Button>
        )}

        {/* Phase 4 & 5 Artifacts Pipeline & Human-in-the-Loop Buttons */}
        {artifacts.length > 0 && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Production Artifacts & Approvals
            </Typography>
            {artifacts.map((art) => (
              <Box key={art.id} sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#050b14' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#00f0ff', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                    {art.type.replace('_', ' ')} (v{art.version})
                  </Typography>
                  <Chip
                    label={art.status.toUpperCase()}
                    size="small"
                    sx={{
                      height: 14,
                      fontSize: '0.55rem',
                      bgcolor: art.status === 'approved' ? 'rgba(16,185,129,0.1)' : art.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: art.status === 'approved' ? '#10b981' : art.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#ffffff', display: 'block', mb: 1.5, lineHeight: 1.3 }}>
                  {art.content}
                </Typography>

                {art.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon style={{ fontSize: 10 }} />}
                      onClick={() => handleApproveArtifact(art.id)}
                      sx={{ fontSize: '0.58rem', py: 0.1, px: 1, minWidth: 'unset' }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<RejectIcon style={{ fontSize: 10 }} />}
                      onClick={() => handleRejectArtifact(art.id)}
                      sx={{ fontSize: '0.58rem', py: 0.1, px: 1, minWidth: 'unset' }}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </Box>
            ))}

            {/* Assemble and build final timeline if all artifacts are resolved */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleImportToEditor}
              disabled={isLoading || artifacts.some(a => a.status === 'rejected')}
              sx={{ fontWeight: 'bold', fontSize: '0.75rem', py: 1 }}
            >
              Assemble Approved Outline Into Timeline
            </Button>
          </Stack>
        )}

        {activeJob && jobProgress < 100 && !activeJob.cancelled && (
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
        )}

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
