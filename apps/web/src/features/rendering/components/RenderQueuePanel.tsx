import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useRendering } from '../hooks/useRendering';

export const RenderQueuePanel: React.FC = () => {
  const { jobs, cancelJob, removeJob } = useRendering();

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Render Queue</Typography>
      <Divider sx={{ mb: 2 }} />

      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {jobs.map((job) => (
          <ListItem
            key={job.id}
            sx={{ mb: 2, p: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1, flexDirection: 'column', alignItems: 'stretch' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{job.projectName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusChip status={job.status} />
                <IconButton size="small" onClick={() => job.status === 'pending' || job.status === 'rendering' ? cancelJob(job.id) : removeJob(job.id)}>
                   <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {(job.status === 'rendering' || job.status === 'pending') && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={job.progress.percentage} sx={{ height: 4, borderRadius: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{Math.round(job.progress.percentage)}%</Typography>
                  <Typography variant="caption" color="text.secondary">{job.progress.fps} FPS</Typography>
                </Box>
              </Box>
            )}

            {job.status === 'completed' && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>Render successful</Typography>
            )}
            {job.status === 'failed' && (
              <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>{job.result?.error || 'Render failed'}</Typography>
            )}
          </ListItem>
        ))}
        {jobs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No active renders</Typography>
        )}
      </List>
    </Box>
  );
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'completed': return <Chip size="small" icon={<SuccessIcon />} label="Done" color="success" variant="outlined" />;
    case 'failed': return <Chip size="small" icon={<ErrorIcon />} label="Failed" color="error" variant="outlined" />;
    case 'cancelled': return <Chip size="small" label="Cancelled" variant="outlined" />;
    case 'rendering': return <Chip size="small" label="Rendering" color="primary" variant="outlined" />;
    default: return <Chip size="small" icon={<PendingIcon />} label="Pending" variant="outlined" />;
  }
};
