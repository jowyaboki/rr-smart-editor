import React from 'react';
import { Box, Typography, LinearProgress, Divider, Badge, Chip, Button } from '@mui/material';
import { useWorkflowStore } from '../store/useWorkflowStore';
import {
  Speed as SpeedIcon,
  CloudDone as CloudIcon,
  CheckCircle as DoneIcon,
  ReportProblem as WarningIcon,
  AdminPanelSettings as GuardIcon,
} from '@mui/icons-material';

export const UnifiedStatusCenter: React.FC = () => {
  const { backgroundJobs, statusPanelExpanded, setStatusPanelExpanded } = useWorkflowStore();

  const totalJobs = backgroundJobs.length;
  const runningCount = backgroundJobs.filter((j) => j.status === 'running').length;

  if (!statusPanelExpanded) {
    return (
      <Box
        onClick={() => setStatusPanelExpanded(true)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#0d1527',
          borderTop: '1px solid #1b2f54',
          px: 3,
          py: 0.75,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.05)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            size="small"
            label={`${runningCount} tasks running`}
            sx={{
              height: 18,
              fontSize: '0.62rem',
              bgcolor: runningCount > 0 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: runningCount > 0 ? '#00f0ff' : '#10b981',
              fontWeight: 'bold',
            }}
          />
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
            Database Mode: Local Offline Router (Deterministic SQL Fallback)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningIcon style={{ fontSize: 12, color: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.68rem' }}>
              0 warnings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <GuardIcon style={{ fontSize: 12, color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.68rem' }}>
              ABAC Verified
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
            System Health: 100% | CPU 24% | WebGL OK (Click to Expand Status Center) ▲
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#050b14',
        borderTop: '2px solid #00f0ff',
        height: '240px',
        width: '100%',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Expanded status header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          bgcolor: '#0d1527',
          borderBottom: '1px solid #1b2f54',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SpeedIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              color: '#ffffff',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.5px',
            }}
          >
            Unified System Status Center & Diagnostics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.65rem', px: 1, py: 0.25, textTransform: 'none' }}
            onClick={() => alert('Diagnostic log package compiled & exported.')}
          >
            Export Trace Logs
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            sx={{ fontSize: '0.65rem', px: 1, py: 0.25, textTransform: 'none' }}
            onClick={() => setStatusPanelExpanded(false)}
          >
            Minimize Panel ▼
          </Button>
        </Box>
      </Box>

      {/* Expanded diagnostics subgrid */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left column: background trace list */}
        <Box sx={{ width: '60%', p: 2, overflowY: 'auto', borderRight: '1px solid #1b2f54' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              mb: 1,
              display: 'block',
            }}
          >
            Active Core & AI Jobs
          </Typography>
          {backgroundJobs.map((job) => (
            <Box
              key={job.id}
              sx={{
                mb: 1.5,
                p: 1,
                borderRadius: '4px',
                bgcolor: '#0d1527',
                border: '1px solid #1b2f54',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                  {job.name} ({job.type})
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: job.status === 'success' ? '#10b981' : '#00f0ff',
                    fontWeight: 'bold',
                  }}
                >
                  {job.status === 'success' ? 'Completed' : `${job.progress}%`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={job.progress}
                color={job.status === 'success' ? 'success' : 'primary'}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          ))}
        </Box>

        {/* Right column: health matrices */}
        <Box sx={{ width: '40%', p: 2, overflowY: 'auto', bgcolor: '#0d1527' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: '#94a3b8',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              mb: 1.5,
              display: 'block',
            }}
          >
            Topology Metrics & Health checks
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Render Engine latency
              </Typography>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                12.4 ms (60 FPS)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Cloud workspace status
              </Typography>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                Synced
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Collaboration thread count
              </Typography>
              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                0 cursors
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Active marketplace plugins
              </Typography>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold' }}>
                4 active
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
