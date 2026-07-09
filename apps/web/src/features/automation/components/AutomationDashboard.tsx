import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AutoAwesomeMotion as BatchIcon,
  Timeline as ProgressIcon
} from '@mui/icons-material';
import { useAutomationStore } from '../store/automationStore';
import { AutomationQueue } from '../queue/AutomationQueue';
import { AutomationService } from '../services/AutomationService';
import { v4 as uuidv4 } from 'uuid';

export const AutomationDashboard: React.FC = () => {
  const { activeBatchJobs, completedBatchJobs, templates } = useAutomationStore();
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('New Batch Job');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const handleStartBatch = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const job = AutomationService.createBatchJob(
      newBatchName,
      template,
      { type: 'static', staticData: Array(10).fill({}).map((_, i) => ({ id: i, name: `Item ${i}` })) },
      { concurrency: 2, priority: 'normal', retryConfig: { maxRetries: 3, backoffMs: 1000 }, outputPattern: 'video_{id}' }
    );

    useAutomationStore.getState().addBatchJob(job);
    AutomationQueue.getInstance().enqueue(job, template);
    setIsNewBatchOpen(false);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Automation Hub</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsNewBatchOpen(true)}
        >
          New Batch
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Active Jobs */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ProgressIcon sx={{ mr: 1 }} /> Active Batches
          </Typography>
          {activeBatchJobs.map(job => (
            <Card key={job.id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">{job.name}</Typography>
                  <Chip size="small" label={job.status.toUpperCase()} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={job.progress.percent}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2">{job.progress.percent}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {job.progress.completed} / {job.progress.total} items completed
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => AutomationQueue.getInstance().cancelJob(job.id)}>
                    <StopIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
          {activeBatchJobs.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No active batches. Start a new one to see progress here.
            </Typography>
          )}
        </Grid>

        {/* History */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>History</Typography>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {completedBatchJobs.map(job => (
              <ListItem
                key={job.id}
                secondaryAction={
                  <IconButton edge="end" size="small"><DeleteIcon fontSize="small" /></IconButton>
                }
              >
                <ListItemText
                  primary={job.name}
                  secondary={`Completed at ${new Date(job.completedAt!).toLocaleTimeString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

      <Dialog open={isNewBatchOpen} onClose={() => setIsNewBatchOpen(false)}>
        <DialogTitle>Configure Batch Job</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            fullWidth
            label="Batch Name"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Template"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            {templates.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
            {templates.length === 0 && <MenuItem disabled>No templates found</MenuItem>}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewBatchOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStartBatch} disabled={!selectedTemplateId}>
            Start Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
