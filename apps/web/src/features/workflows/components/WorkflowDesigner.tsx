import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  CheckCircle as VerifyIcon,
  Settings as ConfigIcon,
  ArrowForward as ArrowIcon,
  FileDownload as ExportIcon,
  DeviceHub as ConnectorIcon,
} from '@mui/icons-material';
import { useWorkflowEngine } from '../hooks/useWorkflowEngine';
import { WorkflowStep, WorkflowStepType } from '@ai-video-editor/shared';

export const WorkflowDesigner: React.FC = () => {
  const engine = useWorkflowEngine();
  const activeWf = engine.workflows.find((w) => w.id === engine.activeWorkflowId);

  const [activeStepTypeToAdd, setActiveStepTypeToAdd] = useState<WorkflowStepType>('command');
  const [newStepName, setNewStepName] = useState('New Editor Action');
  const [validationRun, setValidationRun] = useState(false);

  if (!activeWf) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.default' }}>
        <Typography color="text.secondary">Please select or create a workflow to begin designing.</Typography>
      </Paper>
    );
  }

  const handleAddStep = () => {
    let defaultConfig: any = {};
    if (activeStepTypeToAdd === 'delay') defaultConfig = { durationMs: 1000 };
    if (activeStepTypeToAdd === 'script') defaultConfig = { scriptCode: '// Custom code here\ncontext.variables.myVal = "hello";\nreturn 42;', outputVariable: 'scriptResult' };
    if (activeStepTypeToAdd === 'ai_task') defaultConfig = { prompt: 'Write a caption intro', taskType: 'script', outputVariable: 'aiOutput' };
    if (activeStepTypeToAdd === 'command') defaultConfig = { actionId: 'insert_clip', arguments: { type: 'video', name: 'Intro Clip' } };
    if (activeStepTypeToAdd === 'condition') defaultConfig = { field: 'loopIndex', operator: '==', value: '1', ifTrueStepId: '', ifFalseStepId: '' };
    if (activeStepTypeToAdd === 'transform') defaultConfig = { input: '${generatedScript}', outputVariable: 'transformedText', expression: 'uppercase' };
    if (activeStepTypeToAdd === 'render') defaultConfig = { outputVariable: 'renderResult' };
    if (activeStepTypeToAdd === 'notification') defaultConfig = { title: 'Pipeline Alert', message: 'Hello World', level: 'info' };
    if (activeStepTypeToAdd === 'loop') defaultConfig = { iterations: 3, steps: [], outputVariable: 'loopResult' };

    engine.addStep(activeWf.id, {
      name: newStepName || `Run ${activeStepTypeToAdd}`,
      type: activeStepTypeToAdd,
      config: defaultConfig,
    });
    setNewStepName('New Step');
  };

  const handleValidate = () => {
    engine.validateWorkflow(activeWf.id);
    setValidationRun(true);
  };

  const handleExport = () => {
    const jsonStr = engine.exportWorkflow(activeWf.id);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeWf.name.toLowerCase().replace(/\s+/g, '_')}_workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectedStep = activeWf.steps.find((s) => s.id === engine.selectedStepId);

  const handleConfigChange = (key: string, value: any) => {
    if (!selectedStep) return;
    const updatedConfig = { ...selectedStep.config, [key]: value };
    engine.updateStep(activeWf.id, selectedStep.id, { config: updatedConfig });
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {activeWf.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trigger: <Chip label={activeWf.trigger.type.toUpperCase()} size="small" color="primary" sx={{ ml: 1 }} />
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayIcon />}
            onClick={() => engine.startWorkflow(activeWf.id)}
          >
            Run Pipeline
          </Button>
          <Button variant="outlined" startIcon={<VerifyIcon />} onClick={handleValidate}>
            Validate
          </Button>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport}>
            Export JSON
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => engine.deleteWorkflow(activeWf.id)}
          >
            Delete
          </Button>
        </Box>
      </Paper>

      {validationRun && (
        <Box sx={{ mb: 3 }}>
          {engine.validationErrors.length === 0 ? (
            <Alert severity="success">Workflow contains no cycle or configuration errors! Ready for execution.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {engine.validationErrors.map((err, i) => (
                <Alert key={i} severity={err.severity}>
                  {err.stepId ? `[Step ${err.stepId}] ` : ''}
                  {err.message}
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Canvas Sequence
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Step Type</InputLabel>
                <Select
                  value={activeStepTypeToAdd}
                  label="Step Type"
                  onChange={(e) => setActiveStepTypeToAdd(e.target.value as WorkflowStepType)}
                >
                  <MenuItem value="condition">Condition Branch</MenuItem>
                  <MenuItem value="loop">Loop Block</MenuItem>
                  <MenuItem value="delay">Delay Timeout</MenuItem>
                  <MenuItem value="transform">Transform Data</MenuItem>
                  <MenuItem value="command">Editor Command</MenuItem>
                  <MenuItem value="script">JS Custom Script</MenuItem>
                  <MenuItem value="ai_task">AI Creative Task</MenuItem>
                  <MenuItem value="render">Trigger Render</MenuItem>
                  <MenuItem value="notification">Dispatch Notify</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Custom Step Title"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStep}>
                Add Step
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              {activeWf.steps.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  No steps added yet. Choose a type from above and click "Add Step".
                </Typography>
              ) : (
                activeWf.steps.map((step, index) => {
                  const isCollapsed = step.collapsed;
                  const isSelected = step.id === engine.selectedStepId;

                  return (
                    <React.Fragment key={step.id}>
                      <Card
                        raised={isSelected}
                        sx={{
                          width: '100%',
                          borderLeft: isSelected ? '5px solid #2e7d32' : '5px solid #1976d2',
                          cursor: 'pointer',
                        }}
                        onClick={() => engine.setSelectedStepId(step.id)}
                      >
                        <CardContent sx={{ p: '16px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Chip label={step.type.toUpperCase()} size="small" color="primary" variant="outlined" />
                              <Typography variant="subtitle1" fontWeight="bold">
                                {step.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                (ID: {step.id})
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  engine.duplicateStep(activeWf.id, step.id);
                                }}
                              >
                                <DuplicateIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  engine.updateStep(activeWf.id, step.id, { collapsed: !step.collapsed });
                                }}
                              >
                                {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  engine.removeStep(activeWf.id, step.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Collapse in={!isCollapsed}>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Configuration Payload:
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'action.hover', mt: 0.5 }}>
                                <pre style={{ margin: 0, fontSize: '0.8rem', overflowX: 'auto' }}>
                                  {JSON.stringify(step.config, null, 2)}
                                </pre>
                              </Paper>
                              {step.nextStepId && (
                                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ConnectorIcon fontSize="small" color="action" />
                                  <Typography variant="caption" color="text.secondary">
                                    Next: {activeWf.steps.find((s) => s.id === step.nextStepId)?.name || step.nextStepId}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>

                      {index < activeWf.steps.length - 1 && (
                        <ArrowIcon color="action" sx={{ my: 0.5 }} />
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConfigIcon /> Property Inspector
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!selectedStep ? (
              <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>
                Select a step on the canvas to configure properties or change flow routing.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Step Name"
                  value={selectedStep.name}
                  onChange={(e) => engine.updateStep(activeWf.id, selectedStep.id, { name: e.target.value })}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Route to Next Step</InputLabel>
                  <Select
                    value={selectedStep.nextStepId || ''}
                    label="Route to Next Step"
                    onChange={(e) => engine.connectSteps(activeWf.id, selectedStep.id, e.target.value)}
                  >
                    <MenuItem value="">-- End Flow Sequence --</MenuItem>
                    {activeWf.steps
                      .filter((s) => s.id !== selectedStep.id)
                      .map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Parameters:
                </Typography>

                {selectedStep.type === 'delay' && (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Delay Duration (ms)"
                    value={selectedStep.config.durationMs || 1000}
                    onChange={(e) => handleConfigChange('durationMs', Number(e.target.value))}
                  />
                )}

                {selectedStep.type === 'script' && (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="JavaScript Sandbox Code"
                      value={selectedStep.config.scriptCode || ''}
                      onChange={(e) => handleConfigChange('scriptCode', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Output Variable Name"
                      value={selectedStep.config.outputVariable || ''}
                      onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
                    />
                  </>
                )}

                {selectedStep.type === 'ai_task' && (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>AI Output Mode</InputLabel>
                      <Select
                        value={selectedStep.config.taskType || 'script'}
                        label="AI Output Mode"
                        onChange={(e) => handleConfigChange('taskType', e.target.value)}
                      >
                        <MenuItem value="script">Script Content Text</MenuItem>
                        <MenuItem value="image">Generated Image URL</MenuItem>
                        <MenuItem value="voiceover">Generated Voice URL</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="AI Prompt"
                      value={selectedStep.config.prompt || ''}
                      onChange={(e) => handleConfigChange('prompt', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Store Output Variable"
                      value={selectedStep.config.outputVariable || ''}
                      onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
                    />
                  </>
                )}

                {selectedStep.type === 'command' && (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel>Editor Command Action</InputLabel>
                      <Select
                        value={selectedStep.config.actionId || ''}
                        label="Editor Command Action"
                        onChange={(e) => handleConfigChange('actionId', e.target.value)}
                      >
                        <MenuItem value="create_project">Create Project</MenuItem>
                        <MenuItem value="import_assets">Import Assets</MenuItem>
                        <MenuItem value="create_scene">Create Scene</MenuItem>
                        <MenuItem value="insert_clip">Insert Clip</MenuItem>
                        <MenuItem value="apply_transition">Apply Transition</MenuItem>
                        <MenuItem value="apply_effect">Apply Effect</MenuItem>
                        <MenuItem value="generate_captions">Generate Captions</MenuItem>
                        <MenuItem value="render_video">Render Video</MenuItem>
                        <MenuItem value="export_project">Export Project</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Arguments JSON Payload"
                      value={typeof selectedStep.config.arguments === 'object' ? JSON.stringify(selectedStep.config.arguments, null, 2) : selectedStep.config.arguments || '{}'}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleConfigChange('arguments', parsed);
                        } catch {
                          handleConfigChange('arguments', e.target.value);
                        }
                      }}
                    />
                  </>
                )}

                {selectedStep.type === 'condition' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Condition Property Name"
                      value={selectedStep.config.field || ''}
                      onChange={(e) => handleConfigChange('field', e.target.value)}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={selectedStep.config.operator || 'equals'}
                        label="Operator"
                        onChange={(e) => handleConfigChange('operator', e.target.value)}
                      >
                        <MenuItem value="equals">Equals (==)</MenuItem>
                        <MenuItem value="not_equals">Not Equals (!=)</MenuItem>
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="greater_than">Greater Than (&gt;)</MenuItem>
                        <MenuItem value="less_than">Less Than (&lt;)</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Comparison Target Value"
                      value={selectedStep.config.value || ''}
                      onChange={(e) => handleConfigChange('value', e.target.value)}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>If True, route to</InputLabel>
                      <Select
                        value={selectedStep.config.ifTrueStepId || ''}
                        label="If True, route to"
                        onChange={(e) => handleConfigChange('ifTrueStepId', e.target.value)}
                      >
                        <MenuItem value="">-- End Flow Sequence --</MenuItem>
                        {activeWf.steps
                          .filter((s) => s.id !== selectedStep.id)
                          .map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>If False, route to</InputLabel>
                      <Select
                        value={selectedStep.config.ifFalseStepId || ''}
                        label="If False, route to"
                        onChange={(e) => handleConfigChange('ifFalseStepId', e.target.value)}
                      >
                        <MenuItem value="">-- End Flow Sequence --</MenuItem>
                        {activeWf.steps
                          .filter((s) => s.id !== selectedStep.id)
                          .map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                {selectedStep.type === 'transform' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Input Text/Template"
                      value={selectedStep.config.input || ''}
                      onChange={(e) => handleConfigChange('input', e.target.value)}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Operation Expression</InputLabel>
                      <Select
                        value={selectedStep.config.expression || 'uppercase'}
                        label="Operation Expression"
                        onChange={(e) => handleConfigChange('expression', e.target.value)}
                      >
                        <MenuItem value="uppercase">Convert to UPPERCASE</MenuItem>
                        <MenuItem value="lowercase">Convert to lowercase</MenuItem>
                        <MenuItem value="json_parse">Parse JSON string</MenuItem>
                        <MenuItem value="json_stringify">Stringify to JSON</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Store Output Variable"
                      value={selectedStep.config.outputVariable || ''}
                      onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
                    />
                  </>
                )}

                {selectedStep.type === 'notification' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Alert Title"
                      value={selectedStep.config.title || ''}
                      onChange={(e) => handleConfigChange('title', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Alert Message"
                      value={selectedStep.config.message || ''}
                      onChange={(e) => handleConfigChange('message', e.target.value)}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Alert Severity Level</InputLabel>
                      <Select
                        value={selectedStep.config.level || 'info'}
                        label="Alert Severity Level"
                        onChange={(e) => handleConfigChange('level', e.target.value)}
                      >
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}

                {selectedStep.type === 'loop' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Static Loop Iterations"
                      value={selectedStep.config.iterations || 0}
                      onChange={(e) => handleConfigChange('iterations', Number(e.target.value))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Dynamic Array Items Var"
                      value={selectedStep.config.items || ''}
                      onChange={(e) => handleConfigChange('items', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Output Target Variable Name"
                      value={selectedStep.config.outputVariable || ''}
                      onChange={(e) => handleConfigChange('outputVariable', e.target.value)}
                    />
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
