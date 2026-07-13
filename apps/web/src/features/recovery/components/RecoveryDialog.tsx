import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Warning,
  Restore,
  DeleteForever,
  CloudUpload,
  PlayCircleFilled,
} from '@mui/icons-material';
import { useRecovery } from '../hooks/useRecovery';
import { RecoveryCandidate } from '@ai-video-editor/shared';

interface Props {
  projectId: string;
}

export const RecoveryDialog: React.FC<Props> = ({ projectId }) => {
  const { activeSession, resolveSession, restoreSnapshot } = useRecovery(projectId);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  if (
    !activeSession ||
    activeSession.status !== 'active' ||
    activeSession.candidates.length === 0
  ) {
    return null;
  }

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidateId(id);
  };

  const handleRecover = () => {
    const candidate = activeSession.candidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) return;

    if (candidate.type === 'unsaved_project' && candidate.data) {
      const restored = restoreSnapshot(candidate.data);
      if (restored) {
        resolveSession('recovered');
      }
    } else if (candidate.type === 'interrupted_render') {
      // For interrupted renders, we resolve and offer a notification or log
      resolveSession('recovered');
    }
  };

  const handleDiscardAll = () => {
    if (
      window.confirm(
        'Are you sure you want to discard these recovery backups? Your unsaved local changes will be lost.',
      )
    ) {
      resolveSession('discarded');
    }
  };

  const getCandidateIcon = (type: string) => {
    switch (type) {
      case 'unsaved_project':
        return <CloudUpload color="primary" sx={{ fontSize: 32 }} />;
      case 'interrupted_render':
        return <PlayCircleFilled color="secondary" sx={{ fontSize: 32 }} />;
      case 'incomplete_autosave':
        return <Warning color="warning" sx={{ fontSize: 32 }} />;
      default:
        return <Warning color="error" sx={{ fontSize: 32 }} />;
    }
  };

  const getCandidateLabel = (type: string) => {
    switch (type) {
      case 'unsaved_project':
        return 'Unsaved Progress';
      case 'interrupted_render':
        return 'Interrupted Render';
      case 'incomplete_autosave':
        return 'Incomplete Auto-Save';
      case 'corrupted_snapshot':
        return 'Corrupted Snapshot';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={true} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
        <Warning />
        <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
          Unscheduled Shutdown Recovery
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
        <DialogContentText sx={{ mb: 3, color: 'text.primary' }}>
          We detected that the editor closed unexpectedly. The following recovery snapshots are
          available to restore:
        </DialogContentText>

        <Grid container spacing={2}>
          {activeSession.candidates.map((cand) => {
            const isSelected = selectedCandidateId === cand.id;
            const disabled = !cand.canRestore;

            return (
              <Grid item xs={12} key={cand.id}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    opacity: disabled ? 0.6 : 1,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <CardActionArea
                    onClick={() => !disabled && handleSelectCandidate(cand.id)}
                    disabled={disabled}
                  >
                    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2 }}>
                      {getCandidateIcon(cand.type)}
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {getCandidateLabel(cand.type)}
                          </Typography>
                          <Chip
                            label={new Date(cand.timestamp).toLocaleTimeString()}
                            size="small"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {cand.reason}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteForever />}
          onClick={handleDiscardAll}
        >
          Discard Backups
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="primary"
            variant="contained"
            startIcon={<Restore />}
            disabled={!selectedCandidateId}
            onClick={handleRecover}
          >
            Recover Selection
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
