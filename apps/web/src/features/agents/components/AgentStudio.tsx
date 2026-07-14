import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { PlayCircle, Cancel, SmartToy, Hub, Terminal, History } from '@mui/icons-material';
import { useAgents } from '../hooks/useAgents';
import { AgentType } from '@ai-video-editor/shared';

interface Props {
  projectId: string;
}

export const AgentStudio: React.FC<Props> = ({ projectId }) => {
  const {
    agents,
    activeTasks,
    activeWorkflows,
    selectedTaskId,
    isGenerating,
    runTask,
    runWorkflow,
    cancelTask,
    setSelectedTaskId,
  } = useAgents();

  const [prompt, setPrompt] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('script');

  const handleTriggerTask = () => {
    if (!prompt) return;
    runTask(projectId, `Custom task: ${prompt.substring(0, 30)}...`, selectedAgentType, { prompt });
    setPrompt('');
  };

  const handleTriggerWorkflow = () => {
    if (!prompt) return;
    runWorkflow(projectId, 'Multi-agent creative loop', prompt);
    setPrompt('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
      case 'busy':
        return 'primary';
      case 'failed':
      case 'error':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const selectedTask = activeTasks.find((t) => t.id === selectedTaskId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 2,
        p: 1,
        backgroundColor: 'background.default',
      }}
    >
      {/* Studio Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SmartToy color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          AI Agent Studio
        </Typography>
      </Box>

      {/* Agents Grid */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
        Registered Specialists ({agents.length})
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
        {agents.map((ag) => (
          <Paper
            key={ag.id}
            sx={{
              p: 1,
              minWidth: 120,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: ag.status === 'busy' ? 'primary.main' : 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
              {ag.name}
            </Typography>
            <Chip
              label={ag.status.toUpperCase()}
              size="small"
              color={getStatusColor(ag.status) as any}
              sx={{ fontSize: '0.55rem', height: 16, mt: 0.5 }}
            />
          </Paper>
        ))}
      </Box>

      <Divider />

      {/* Orchestration Form */}
      <Paper
        sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Hub sx={{ fontSize: 16 }} /> Dispatch Task / Workflow
        </Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          placeholder="E.g., Compose a 30s tech intro, place clips, and run overlaps check..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              startIcon={<PlayCircle />}
              onClick={handleTriggerTask}
              disabled={!prompt || isGenerating}
              sx={{ textTransform: 'none' }}
            >
              Run Single Task
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              size="small"
              variant="contained"
              fullWidth
              startIcon={<Hub />}
              onClick={handleTriggerWorkflow}
              disabled={!prompt || isGenerating}
              sx={{ textTransform: 'none' }}
            >
              Orchestrate Chain
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Active Workflows & Tasks */}
      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <History sx={{ fontSize: 14 }} /> Active Chains ({activeWorkflows.length})
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {activeWorkflows.map((wf) => (
              <Paper
                key={wf.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {wf.name}
                  </Typography>
                  <Chip
                    label={wf.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(wf.status) as any}
                    sx={{ fontSize: '0.55rem', height: 16 }}
                  />
                </Box>
                {/* Step timeline */}
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {wf.steps.map((step) => (
                    <Box
                      key={step.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        • {step.name}
                      </Typography>
                      <Chip
                        label={`${step.progress}%`}
                        size="small"
                        color={getStatusColor(step.status) as any}
                        sx={{ fontSize: '0.55rem', height: 14 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Terminal sx={{ fontSize: 14 }} /> Selected Agent Terminal Logs
          </Typography>
          <Paper
            sx={{
              flexGrow: 1,
              p: 1.5,
              bgcolor: '#011627',
              color: '#80cbc4',
              fontFamily: 'monospace',
              overflowY: 'auto',
              height: 200,
            }}
          >
            {selectedTask ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    pb: 0.5,
                    borderBottom: '1px solid #1e2e3e',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Agent: {selectedTask.assignedAgent.toUpperCase()}
                  </Typography>
                  {selectedTask.status === 'running' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => cancelTask(selectedTask.id)}
                    >
                      <Cancel sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
                {selectedTask.logs.map((log, idx) => (
                  <Typography
                    key={idx}
                    variant="caption"
                    sx={{ display: 'block', fontSize: '0.7rem' }}
                  >
                    {log}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center', color: '#5f7e97' }}>
                <Terminal sx={{ fontSize: 32, mb: 1, color: '#334c5e' }} />
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Logs will print here once tasks begin.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
