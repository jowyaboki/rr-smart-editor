import React from 'react';
import { Box, Typography, Button, CircularProgress, Tooltip } from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Save, CloudQueue } from '@mui/icons-material';
import { useRecoveryStore } from '../store/recoveryStore';
import { useAutoSave } from '../hooks/useAutoSave';

interface Props {
  projectId: string;
  projectName: string;
}

export const AutoSaveStatusIndicator: React.FC<Props> = ({ projectId, projectName }) => {
  const autoSaveState = useRecoveryStore((s) => s.autoSaveState);
  const { triggerManualSave } = useAutoSave(projectId, projectName);

  const handleManualSave = async () => {
    await triggerManualSave('Manual user trigger');
  };

  const renderStatus = () => {
    switch (autoSaveState.status) {
      case 'saving':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} color="primary" />
            <Typography variant="caption" color="text.secondary">
              Saving...
            </Typography>
          </Box>
        );
      case 'success':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleOutline sx={{ fontSize: 14, color: 'success.main' }} />
            <Typography variant="caption" color="success.main">
              Saved
            </Typography>
          </Box>
        );
      case 'failed':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ErrorOutline sx={{ fontSize: 14, color: 'error.main' }} />
            <Typography variant="caption" color="error.main">
              Save failed
            </Typography>
          </Box>
        );
      case 'idle':
      default:
        if (autoSaveState.pendingChangesCount > 0) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CloudQueue sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="warning.main">
                {autoSaveState.pendingChangesCount} changes pending
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CloudQueue sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Up to date
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
      {renderStatus()}
      {autoSaveState.lastSavedAt && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          Last saved: {new Date(autoSaveState.lastSavedAt).toLocaleTimeString()}
        </Typography>
      )}
      <Tooltip title="Trigger immediate manual save">
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<Save style={{ fontSize: 14 }} />}
          onClick={handleManualSave}
          disabled={autoSaveState.status === 'saving'}
          sx={{ height: 24, fontSize: '0.75rem', textTransform: 'none' }}
        >
          Save Now
        </Button>
      </Tooltip>
    </Box>
  );
};
