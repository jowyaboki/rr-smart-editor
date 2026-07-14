import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  LinearProgress,
} from '@mui/material';
import { Speed, Storage, Assignment, BarChart, Refresh } from '@mui/icons-material';
import { MetricsService } from '../services/MetricsService';
import { CacheService } from '../services/CacheService';
import { SchedulerService } from '../services/SchedulerService';
import { BenchmarkRunner } from '../services/BenchmarkRunner';
import { BenchmarkResult } from '@ai-video-editor/shared';

export const PerformanceDashboard: React.FC = () => {
  const [report, setReport] = useState(MetricsService.compileReport());
  const [tasks, setTasks] = useState(SchedulerService.getAllTasks());
  const [cacheStats, setCacheStats] = useState(CacheService.getStats());
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);

  const handleRefresh = () => {
    setReport(MetricsService.compileReport());
    setTasks(SchedulerService.getAllTasks());
    setCacheStats(CacheService.getStats());
  };

  useEffect(() => {
    const id = setInterval(handleRefresh, 2000); // Poll diagnostic stats
    return () => clearInterval(id);
  }, []);

  const runSystemBenchmarks = async () => {
    setBenchmarking(true);
    try {
      const results = await BenchmarkRunner.runAllBenchmarks();
      setBenchmarks(results);
    } catch (err) {
      console.error(err);
    } finally {
      setBenchmarking(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'success.main';
    if (score >= 70) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto', backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Speed /> Performance & Scale Diagnostics
        </Typography>
        <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Metric 1: Health Score */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', position: 'relative' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                System Health Score
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 'bold', mt: 1, color: getHealthColor(report.healthScore) }}
              >
                {report.healthScore}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Calculated from real-time latency & FPS
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2: Memory & FPS */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Real-Time FPS & Heap
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                {report.averages.previewFps} FPS
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Memory Usage: {report.averages.memoryUsageMb} MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3: Cache Hit Rate */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Cache Diagnostics
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                {report.cacheStats.hitRatePercentage}% Hit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Filled: {cacheStats.fillPercentage}% ({cacheStats.entryCount} entries)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {/* Background Tasks lists */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Assignment /> Background Task Scheduler
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', height: 250, overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No active background threads scheduled.
                </Typography>
              </Box>
            ) : (
              <List dense>
                {tasks.map((task) => (
                  <Box key={task.id} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {task.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.status.toUpperCase()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={task.progress}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Benchmarking module */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BarChart /> Scalability Benchmarks
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={runSystemBenchmarks}
              disabled={benchmarking}
              startIcon={benchmarking ? <CircularProgress size={12} /> : null}
            >
              Run Suite
            </Button>
          </Box>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', height: 250, overflowY: 'auto' }}>
            {benchmarks.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Click 'Run Suite' to benchmark composition rebuilds up to 1000 clips!
                </Typography>
              </Box>
            ) : (
              <List dense>
                {benchmarks.map((res, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={res.scenarioName}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              - Rebuild Time: {res.compositionBuildTimeMs}ms
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              - Virtualization Latency: {res.virtualizationTimeMs}ms
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              - Heap Delta: {res.memoryDeltaMb} MB | Projected FPS:{' '}
                              {res.fpsUnderLoad}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < benchmarks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
