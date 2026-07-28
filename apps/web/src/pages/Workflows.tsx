import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Dashboard as DesignerIcon,
  History as HistoryIcon,
  AutoAwesome as TemplateIcon,
  Code as VarIcon,
  Publish as ImportIcon,
} from '@mui/icons-material';
import { useWorkflowStore } from '../features/workflows/store/useWorkflowStore';
import { useWorkflowEngine } from '../features/workflows/hooks/useWorkflowEngine';
import { WorkflowDesigner } from '../features/workflows/components/WorkflowDesigner';
import { WorkflowExecutions } from '../features/workflows/components/WorkflowExecutions';
import { WorkflowTemplates } from '../features/workflows/components/WorkflowTemplates';
import { WorkflowVariables } from '../features/workflows/components/WorkflowVariables';

const Workflows: React.FC = () => {
  const store = useWorkflowStore();
  const engine = useWorkflowEngine();

  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowTrigger, setNewFlowTrigger] = useState('manual');

  useEffect(() => {
    store.initializeStore();
  }, []);

  const handleCreate = () => {
    if (!newFlowName || newFlowName.trim() === '') return;
    engine.createWorkflow(newFlowName, newFlowTrigger);
    setNewFlowName('');
    setCreateDialogOpen(false);
    setActiveTab(0);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        engine.importWorkflow(text);
        setActiveTab(0);
      } catch (err) {
        alert('Failed to parse imported workflow JSON.');
      }
    };
    reader.readAsText(file);
  };

  const activeWf = engine.workflows.find((w) => w.id === engine.activeWorkflowId);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Workflow Automation Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Build, test, and orchestrate automated media production pipelines locally.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImportIcon />}
          >
            Import JSON
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Pipeline
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%', minHeight: 500 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              My Pipelines
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {engine.workflows.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>
                No workflows created. Click "Create Pipeline" to start.
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {engine.workflows.map((wf) => {
                  const isActive = wf.id === engine.activeWorkflowId;
                  return (
                    <ListItem
                      button
                      key={wf.id}
                      selected={isActive}
                      onClick={() => engine.setActiveWorkflowId(wf.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
                        backgroundColor: isActive ? 'action.selected' : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={wf.name}
                        secondary={`Steps: ${wf.steps.length} | Trigger: ${wf.trigger.type}`}
                        primaryTypographyProps={{ fontWeight: isActive ? 'bold' : 'normal' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, nv) => setActiveTab(nv)}>
              <Tab icon={<DesignerIcon />} iconPosition="start" label="Visual Designer" disabled={!activeWf} />
              <Tab icon={<HistoryIcon />} iconPosition="start" label="Execution & Monitor" />
              <Tab icon={<TemplateIcon />} iconPosition="start" label="Blueprints & Templates" />
              <Tab icon={<VarIcon />} iconPosition="start" label="Pipeline Variables" disabled={!activeWf} />
            </Tabs>
          </Box>

          <Box sx={{ minHeight: 400 }}>
            {activeTab === 0 && activeWf && <WorkflowDesigner />}
            {activeTab === 1 && <WorkflowExecutions />}
            {activeTab === 2 && <WorkflowTemplates />}
            {activeTab === 3 && activeWf && <WorkflowVariables />}
          </Box>
        </Grid>
      </Grid>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pipeline Name"
            fullWidth
            variant="standard"
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Trigger Event</InputLabel>
            <Select
              value={newFlowTrigger}
              label="Trigger Event"
              onChange={(e) => setNewFlowTrigger(e.target.value)}
            >
              <MenuItem value="manual">Manual Execution</MenuItem>
              <MenuItem value="project_open">On Project Opened</MenuItem>
              <MenuItem value="project_save">On Project Saved</MenuItem>
              <MenuItem value="render_complete">On Render Completed</MenuItem>
              <MenuItem value="asset_imported">On Asset Imported</MenuItem>
              <MenuItem value="timeline_changed">On Timeline Changed</MenuItem>
              <MenuItem value="template_applied">On Template Applied</MenuItem>
              <MenuItem value="webhook">Cloud Webhook Trigger (Future)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newFlowName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workflows;
