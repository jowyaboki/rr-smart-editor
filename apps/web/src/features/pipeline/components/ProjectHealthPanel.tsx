import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Healing as FixIcon,
  AutoFixHigh as OptimizeIcon
} from '@mui/icons-material';
import { usePipelineStore } from '../store/pipelineStore';
import { OptimizationService } from '../services/OptimizationService';
import { HealthService } from '../services/HealthService';

export const ProjectHealthPanel: React.FC = () => {
  const { health, updateHealth } = usePipelineStore();

  const handleFix = async (tip: any) => {
    const success = await OptimizationService.applyFix(tip);
    if (success) {
      const newHealth = await HealthService.calculateHealth();
      updateHealth(newHealth);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success.main';
    if (score >= 70) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Project Health</Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={health.score}
            sx={{ color: getScoreColor(health.score) }}
          />
          <Box sx={{
            top: 0, left: 0, bottom: 0, right: 0,
            position: 'absolute', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="caption" component="div" color="text.secondary">
              {Math.round(health.score)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="error">{health.errors}</Typography>
            <Typography variant="caption">Errors</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="warning.main">{health.warnings}</Typography>
            <Typography variant="caption">Warnings</Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="subtitle2" gutterBottom>Optimization Tips</Typography>
      <List dense>
        {health.tips.map((tip) => (
          <ListItem key={tip.id} sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {tip.type === 'error' ? <ErrorIcon color="error" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={tip.message}
              secondary={tip.category.toUpperCase()}
              primaryTypographyProps={{ variant: 'body2' }}
            />
            {tip.fixable && (
              <Button size="small" startIcon={<FixIcon />} onClick={() => handleFix(tip)}>
                Fix
              </Button>
            )}
          </ListItem>
        ))}
        {health.tips.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Your project is in top shape!
          </Typography>
        )}
      </List>
    </Box>
  );
};
