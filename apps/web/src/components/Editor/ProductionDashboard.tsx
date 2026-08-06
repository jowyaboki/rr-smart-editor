import React from 'react';
import { Box, Typography, Button, Divider, LinearProgress, Grid, Chip } from '@mui/material';
import {
  Speed as SpeedIcon,
  CloudUpload as CloudIcon,
  DoneAll as DoneIcon,
  TrendingUp as TrendIcon,
  AttachMoney as CostIcon,
  LocalActivity as HealthIcon
} from '@mui/icons-material';

export const ProductionDashboard: React.FC = () => {
  const operations = [
    { label: 'SLA Milestone target', val: '94% On Time', progress: 94, color: 'success' },
    { label: 'Shared Storage space', val: '1.2 TB of 5 TB', progress: 24, color: 'primary' },
    { label: 'AI suggest accept rate', val: '86% Accepted', progress: 86, color: 'secondary' },
  ];

  const executiveKPIs = [
    { label: 'Compute Cost', val: '$14.20 / Hr', icon: <CostIcon style={{ color: '#10b981', fontSize: '18px' }} /> },
    { label: 'Active Renders', val: '12 active shards', icon: <SpeedIcon style={{ color: '#00f0ff', fontSize: '18px' }} /> },
    { label: 'Cloud Sync rate', val: '1.4 Gbps speed', icon: <CloudIcon style={{ color: '#ec4899', fontSize: '18px' }} /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
      {/* 1. Project Health Status center card (v11 Sprint) */}
      <Box sx={{ p: 1.5, border: '2px solid #00f0ff', borderRadius: '8px', bgcolor: 'rgba(0, 240, 255, 0.05)', boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HealthIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              Project Health & Diagnostics
            </Typography>
          </Box>
          <Chip label="HEALTHY (100%)" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#10b981', color: '#050b14', fontWeight: 'bold' }} />
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, lineHeight: 1.3 }}>
          Unused Media Files: <Typography component="span" variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>2 assets</Typography> | Pending Reviews: <Typography component="span" variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>1 item</Typography><br />
          Render Readiness: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Ready</Typography> | Delivery Readiness: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Ready</Typography>
        </Typography>
      </Box>

      {/* 2. Production SLA & Milestones */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
          Production Operations & Milestones
        </Typography>

        {operations.map((op, idx) => (
          <Box key={idx} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.7rem' }}>
                {op.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '0.65rem' }}>
                {op.val}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={op.progress}
              color={op.color as any}
              sx={{ height: 4, borderRadius: 2, bgcolor: '#050b14' }}
            />
          </Box>
        ))}
      </Box>

      {/* 3. Executive Analytics Overview (Line / Metric KPIs) */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
          Executive Resource Utilization
        </Typography>

        <Grid container spacing={1.5}>
          {executiveKPIs.map((kpi, idx) => (
            <Grid item xs={6} key={idx}>
              <Box sx={{ p: 1, borderRadius: '4px', bgcolor: '#050b14', border: '1px solid #1b2f54', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {kpi.icon}
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>
                    {kpi.label}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.8rem', pl: 1 }}>
                  {kpi.val}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 4. Render throughput trends / Live shard diagnostics */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Cluster Shard Efficiency
          </Typography>
          <Chip label="Optimal SLA" size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '40px', gap: '3px', px: 1 }}>
          {[12, 24, 38, 56, 78, 92, 100, 84, 62, 45, 88, 94].map((h, idx) => (
            <Box
              key={idx}
              sx={{
                flexGrow: 1,
                height: `${h}%`,
                bgcolor: '#10b981',
                borderRadius: '1px',
                opacity: 0.8
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#94a3b8' }}>Hour: 00</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#94a3b8' }}>Current Target</Typography>
        </Box>
      </Box>
    </Box>
  );
};
