import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import { Delete, History, CompareArrows, RestorePage, ArrowForward } from '@mui/icons-material';
import { useRecovery } from '../hooks/useRecovery';
import { ProjectSnapshot } from '@ai-video-editor/shared';

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export const SnapshotBrowser: React.FC<Props> = ({ projectId, open, onClose }) => {
  const {
    snapshots,
    loadSnapshots,
    deleteSnapshot,
    compareSnapshots,
    lastComparison,
    restoreSnapshot,
  } = useRecovery(projectId);

  const [selectedForCompareA, setSelectedForCompareA] = useState<string | null>(null);
  const [selectedForCompareB, setSelectedForCompareB] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadSnapshots();
    }
  }, [open, loadSnapshots]);

  const handleRestore = (snapshot: ProjectSnapshot) => {
    const success = restoreSnapshot(snapshot);
    if (success) {
      onClose();
    }
  };

  const handleCompare = () => {
    if (!selectedForCompareA || !selectedForCompareB) return;
    const snapA = snapshots.find((s) => s.id === selectedForCompareA);
    const snapB = snapshots.find((s) => s.id === selectedForCompareB);
    if (snapA && snapB) {
      compareSnapshots(snapA, snapB);
      setCompareDialogOpen(true);
    }
  };

  const toggleCompareSelect = (id: string) => {
    if (selectedForCompareA === id) {
      setSelectedForCompareA(null);
    } else if (selectedForCompareB === id) {
      setSelectedForCompareB(null);
    } else if (!selectedForCompareA) {
      setSelectedForCompareA(id);
    } else if (!selectedForCompareB) {
      setSelectedForCompareB(id);
    } else {
      // Rotate selections
      setSelectedForCompareA(selectedForCompareB);
      setSelectedForCompareB(id);
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'autosave':
        return 'info';
      case 'manual':
        return 'primary';
      case 'render':
        return 'secondary';
      case 'close':
        return 'warning';
      case 'crash':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <History color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Project Snapshots History
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled={!selectedForCompareA || !selectedForCompareB}
          startIcon={<CompareArrows />}
          onClick={handleCompare}
        >
          Compare Selected
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
        {snapshots.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No snapshots recorded yet. Auto-save is running to back up your progress.
            </Typography>
          </Box>
        ) : (
          <List>
            {snapshots.map((snap) => {
              const isSelectedA = selectedForCompareA === snap.id;
              const isSelectedB = selectedForCompareB === snap.id;
              const isSelected = isSelectedA || isSelectedB;

              return (
                <Paper
                  key={snap.id}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: isSelected
                      ? isSelectedA
                        ? 'primary.main'
                        : 'secondary.main'
                      : 'divider',
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={snap.metadata.trigger.toUpperCase()}
                          size="small"
                          color={getTriggerColor(snap.metadata.trigger) as any}
                          sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}
                        />
                        <Typography variant="subtitle2">
                          {new Date(snap.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {snap.metadata.description || 'Automatic checkpoint'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        ID: {snap.id} | Hash: {snap.metadata.hash}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
                    >
                      <Tooltip
                        title={isSelected ? 'Deselect from compare' : 'Select for comparison'}
                      >
                        <Button
                          variant={isSelected ? 'contained' : 'outlined'}
                          color={isSelectedA ? 'primary' : isSelectedB ? 'secondary' : 'inherit'}
                          size="small"
                          onClick={() => toggleCompareSelect(snap.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          {isSelectedA
                            ? 'Compare (A)'
                            : isSelectedB
                              ? 'Compare (B)'
                              : 'Select to Compare'}
                        </Button>
                      </Tooltip>

                      <Tooltip title="Restore snapshot state into timeline">
                        <IconButton color="success" onClick={() => handleRestore(snap)}>
                          <RestorePage />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete snapshot permanently">
                        <IconButton color="error" onClick={() => deleteSnapshot(snap.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

      {/* Comparison Sub-dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Snapshot Comparison Details</DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
          {lastComparison && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={5}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="primary">
                      Snapshot A
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lastComparison.snapAId}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowForward />
                </Grid>
                <Grid item xs={5}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="secondary">
                      Snapshot B
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lastComparison.snapBId}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Name changed: {lastComparison.nameChanged ? 'Yes' : 'No'}
                  {lastComparison.nameChange && (
                    <span>
                      {' '}
                      (from "{lastComparison.nameChange.from}" to "{lastComparison.nameChange.to}")
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Timeline changed: {lastComparison.timelineChanged ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Asset count difference: {lastComparison.assetCountDifference} assets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Timestamp spacing: {lastComparison.createdAtDiffMinutes} minutes
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Added clips */}
              {lastComparison.addedClips.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    Added Clips ({lastComparison.addedClips.length})
                  </Typography>
                  <List dense>
                    {lastComparison.addedClips.map((clip: any) => (
                      <ListItem key={clip.id}>
                        <ListItemText
                          primary={`${clip.name || clip.id} (${clip.type.toUpperCase()})`}
                          secondary={`Start frame: ${clip.start}, Duration: ${clip.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Removed clips */}
              {lastComparison.removedClips.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 'bold' }}>
                    Removed Clips ({lastComparison.removedClips.length})
                  </Typography>
                  <List dense>
                    {lastComparison.removedClips.map((clip: any) => (
                      <ListItem key={clip.id}>
                        <ListItemText
                          primary={`${clip.name || clip.id} (${clip.type.toUpperCase()})`}
                          secondary={`Start frame: ${clip.start}, Duration: ${clip.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Modified clips */}
              {lastComparison.modifiedClips.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    Modified Clips ({lastComparison.modifiedClips.length})
                  </Typography>
                  <List dense>
                    {lastComparison.modifiedClips.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText primary={item.name} secondary={item.changes.join(' | ')} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {lastComparison.addedClips.length === 0 &&
                lastComparison.removedClips.length === 0 &&
                lastComparison.modifiedClips.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No clip changes detected between these two snapshots.
                  </Typography>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
