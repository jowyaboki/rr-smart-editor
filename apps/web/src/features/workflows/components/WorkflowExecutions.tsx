import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Chip,
  Collapse,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Cancel as CancelIcon,
  Replay as RetryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  Done as SuccessIcon,
  Error as FailedIcon,
} from '@mui/icons-material';
import { useWorkflowEngine } from '../hooks/useWorkflowEngine';
import { WorkflowExecution } from '@ai-video-editor/shared';

export const WorkflowExecutions: React.FC = () => {
  const engine = useWorkflowEngine();
  const [expandedExecId, setExpandedExecId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedExecId(expandedExecId === id ? null : id);
  };

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'running':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon /> Execution History & Monitoring
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {engine.activeExecutions.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
          No workflows have been executed yet. Click "Run Pipeline" in the Designer to start.
        </Typography>
      ) : (
        <List>
          {engine.activeExecutions.map((exec) => {
            const isExpanded = expandedExecId === exec.id;
            const wf = engine.workflows.find((w) => w.id === exec.workflowId);

            return (
              <Box key={exec.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <ListItem button onClick={() => toggleExpand(exec.id)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography fontWeight="bold" variant="subtitle2">
                          {wf?.name || 'Unknown Workflow'}
                        </Typography>
                        <Chip
                          label={exec.status.toUpperCase()}
                          color={getStatusColor(exec.status)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({exec.id})
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1, width: '100%', maxWidth: 400 }}>
                        <LinearProgress
                          variant="determinate"
                          value={exec.progress}
                          color={getStatusColor(exec.status)}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Progress: {exec.progress}% | Started: {new Date(exec.startedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction sx={{ display: 'flex', gap: 0.5 }}>
                    {exec.status === 'running' && (
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          engine.pauseWorkflow(exec.id);
                        }}
                      >
                        <PauseIcon />
                      </IconButton>
                    )}
                    {exec.status === 'paused' && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          engine.resumeWorkflow(exec.workflowId, exec.id);
                        }}
                      >
                        <ResumeIcon />
                      </IconButton>
                    )}
                    {(exec.status === 'running' || exec.status === 'paused') && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          engine.cancelWorkflow(exec.id);
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                    {exec.status === 'failed' && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          engine.retryWorkflow(exec.workflowId, exec.id);
                        }}
                      >
                        <RetryIcon />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => toggleExpand(exec.id)}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <Collapse in={isExpanded}>
                  <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Step Execution Logs:
                    </Typography>
                    {exec.history.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Waiting for steps to run...
                      </Typography>
                    ) : (
                      <List dense sx={{ p: 0 }}>
                        {exec.history.map((log, i) => {
                          const step = wf?.steps.find((s) => s.id === log.stepId);
                          const isSuccess = log.status === 'success';

                          return (
                            <ListItem key={i} sx={{ px: 0, py: 0.5, display: 'block' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isSuccess ? (
                                  <SuccessIcon color="success" fontSize="small" />
                                ) : (
                                  <FailedIcon color="error" fontSize="small" />
                                )}
                                <Typography variant="body2" fontWeight="medium">
                                  {step?.name || log.stepId}
                                </Typography>
                                <Chip
                                  label={log.status.toUpperCase()}
                                  size="small"
                                  color={isSuccess ? 'success' : 'error'}
                                  sx={{ height: 16, fontSize: '0.65rem' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </Typography>
                              </Box>

                              {/* Output / Error detailed box */}
                              <Box sx={{ ml: 3, mt: 0.5 }}>
                                {isSuccess && log.output && (
                                  <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'background.paper' }}>
                                    <pre style={{ margin: 0, fontSize: '0.75rem', overflowX: 'auto' }}>
                                      {JSON.stringify(log.output, null, 2)}
                                    </pre>
                                  </Paper>
                                )}
                                {!isSuccess && log.error && (
                                  <Alert severity="error" sx={{ py: 0, px: 1, mt: 0.5 }}>
                                    <Typography variant="caption" display="block">
                                      {log.error}
                                    </Typography>
                                  </Alert>
                                )}
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </List>
      )}
    </Paper>
  );
};
