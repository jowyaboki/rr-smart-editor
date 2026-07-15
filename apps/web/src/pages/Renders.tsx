import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Cancel as CancelIcon,
  Refresh as RetryIcon,
  Download as DownloadIcon,
  Dns as WorkerIcon,
  Analytics as MetricsIcon,
  Terminal as TerminalIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RenderJob {
  id: string;
  projectId: string;
  priority: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'paused' | 'cancelled';
  progress: number;
  stage: string;
  createdAt: string;
  error?: string;
  logs: string[];
  warnings: string[];
  settings: {
    format: string;
    codec: string;
    resolution: { width: number; height: number };
    fps: number;
  };
  metrics?: {
    durationMs: number;
    fps: number;
    cpuUsage: number;
    memoryUsage: number;
    frameCount: number;
    renderTimePerFrameMs: number;
  };
  artifacts?: Array<{
    id: string;
    url: string;
    format: string;
    size: number;
  }>;
}

interface RenderWorker {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'offline';
  lastHeartbeat: string;
  capabilities: {
    maxConcurrentJobs: number;
    supportedFormats: string[];
  };
  systemInfo?: {
    cpuUsage: number;
    memoryUsage: number;
  };
}

interface QueueMetrics {
  jobs: {
    total: number;
    queued: number;
    rendering: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageFps: number;
  };
  workers: {
    total: number;
    active: number;
    busy: number;
    idle: number;
  };
}

const Renders: React.FC = () => {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [workers, setWorkers] = useState<RenderWorker[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [queueStatus, setQueueStatus] = useState<'running' | 'paused'>('running');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, workersRes, metricsRes, statusRes] = await Promise.all([
          fetch(`${API_URL}/renders/jobs`),
          fetch(`${API_URL}/renders/workers`),
          fetch(`${API_URL}/renders/metrics`),
          fetch(`${API_URL}/renders/queue/status`),
        ]);

        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (workersRes.ok) setWorkers(await workersRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (statusRes.ok) {
          const { status } = await statusRes.json();
          setQueueStatus(status);
        }
      } catch (err) {
        console.error('Error fetching render dashboard data', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePauseQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/renders/queue/pause`, { method: 'POST' });
      if (res.ok) setQueueStatus('paused');
    } catch (err) {
      setErrorMsg('Failed to pause queue');
    }
  };

  const handleResumeQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/renders/queue/resume`, { method: 'POST' });
      if (res.ok) setQueueStatus('running');
    } catch (err) {
      setErrorMsg('Failed to resume queue');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`${API_URL}/renders/jobs/${jobId}/cancel`, { method: 'POST' });
      if (!res.ok) setErrorMsg('Failed to cancel job');
    } catch (err) {
      setErrorMsg('Error cancelling job');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`${API_URL}/renders/jobs/${jobId}/retry`, { method: 'POST' });
      if (!res.ok) setErrorMsg('Failed to retry job');
    } catch (err) {
      setErrorMsg('Error retrying job');
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || (jobs.length > 0 ? jobs[0] : null);

  const getStatusChipColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rendering':
        return 'warning';
      case 'queued':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getProgressColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rendering':
        return 'warning';
      case 'queued':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Distributed Render Queue Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {queueStatus === 'running' ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PauseIcon />}
              onClick={handlePauseQueue}
            >
              Pause Queue Execution
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<ResumeIcon />}
              onClick={handleResumeQueue}
            >
              Resume Queue Execution
            </Button>
          )}
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <MetricsIcon color="primary" fontSize="large" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Rendering/Queued Jobs
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {metrics.jobs.rendering} / {metrics.jobs.queued}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <MetricsIcon color="success" fontSize="large" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Completed / Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {metrics.jobs.completed} / {metrics.jobs.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkerIcon color="info" fontSize="large" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Active / Idle Workers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {metrics.workers.active} / {metrics.workers.idle}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <MetricsIcon color="warning" fontSize="large" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Avg Rendering Speed
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {metrics.jobs.averageFps} FPS
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Active Queue Jobs
            </Typography>
            {jobs.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No render jobs in queue. Submit a project from the editor!
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Job ID</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow
                        key={job.id}
                        hover
                        selected={selectedJob?.id === job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace' }}>{job.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={job.priority.toUpperCase()}
                            size="small"
                            variant="outlined"
                            color={
                              job.priority === 'critical'
                                ? 'error'
                                : job.priority === 'high'
                                  ? 'warning'
                                  : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ textTransform: 'uppercase' }}>
                          {job.settings.format}
                        </TableCell>
                        <TableCell sx={{ width: '25%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={job.progress}
                                color={getProgressColor(job.status)}
                              />
                            </Box>
                            <Typography variant="caption">{Math.floor(job.progress)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={job.status.toUpperCase()}
                            size="small"
                            color={getStatusChipColor(job.status)}
                          />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          {job.status === 'rendering' || job.status === 'queued' ? (
                            <Tooltip title="Cancel Job">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleCancelJob(job.id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Retry Job">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleRetryJob(job.id)}
                              >
                                <RetryIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkerIcon color="primary" /> Worker Fleet Monitor
            </Typography>
            <Grid container spacing={2}>
              {workers.map((worker) => (
                <Grid item xs={12} sm={6} key={worker.id}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 'bold' }}>{worker.name}</Typography>
                      <Chip
                        label={worker.status.toUpperCase()}
                        size="small"
                        color={
                          worker.status === 'idle'
                            ? 'success'
                            : worker.status === 'busy'
                              ? 'warning'
                              : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ID: {worker.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Formats: {worker.capabilities.supportedFormats.join(', ').toUpperCase()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {worker.status !== 'offline' && worker.systemInfo ? (
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            CPU Load
                          </Typography>
                          <LinearProgress variant="determinate" value={worker.systemInfo.cpuUsage} color="info" />
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {worker.systemInfo.cpuUsage}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Memory Load
                          </Typography>
                          <LinearProgress variant="determinate" value={worker.systemInfo.memoryUsage} color="info" />
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {worker.systemInfo.memoryUsage}%
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Worker is offline or initializing
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          {selectedJob ? (
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Job Inspector: {selectedJob.id}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Enqueued: {new Date(selectedJob.createdAt).toLocaleString()}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Active Stage
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {selectedJob.stage}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    FPS / Speed
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedJob.metrics?.fps ? `${selectedJob.metrics.fps} FPS` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Resolution
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {selectedJob.settings.resolution.width}x{selectedJob.settings.resolution.height}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Codec / Format
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {selectedJob.settings.codec} / {selectedJob.settings.format}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Frame Progress ({Math.floor(selectedJob.progress)}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedJob.progress}
                  sx={{ height: 10, borderRadius: 2 }}
                  color={getProgressColor(selectedJob.status)}
                />
              </Box>

              {selectedJob.status === 'completed' && selectedJob.artifacts && selectedJob.artifacts.length > 0 && (
                <Button
                  component="a"
                  href={`${API_URL}${selectedJob.artifacts[0].url}`}
                  download
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  sx={{ mb: 3 }}
                >
                  Download Output Artifact
                </Button>
              )}

              {selectedJob.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {selectedJob.error}
                </Alert>
              )}

              {selectedJob.warnings.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
                    <WarningIcon fontSize="small" /> Warnings ({selectedJob.warnings.length})
                  </Typography>
                  <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, borderLeft: '3px solid', borderColor: 'warning.main' }}>
                    {selectedJob.warnings.map((warn, index) => (
                      <Typography key={index} variant="caption" display="block" color="warning.main">
                        {warn}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TerminalIcon fontSize="small" /> Execution Logs Console
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: 250,
                    overflowY: 'auto',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                  }}
                >
                  <Box>
                    {selectedJob.logs.map((log, index) => (
                      <Typography key={index} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                        {log}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a job to view real-time logs and progress details</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Renders;
