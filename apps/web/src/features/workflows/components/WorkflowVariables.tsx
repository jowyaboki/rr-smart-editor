import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Code as VarIcon,
} from '@mui/icons-material';
import { useWorkflowEngine } from '../hooks/useWorkflowEngine';
import { WorkflowVariable, VariableScope } from '@ai-video-editor/shared';

export const WorkflowVariables: React.FC = () => {
  const engine = useWorkflowEngine();
  const activeWf = engine.workflows.find((w) => w.id === engine.activeWorkflowId);

  const [newVarName, setNewVarName] = useState('');
  const [newVarType, setNewVarType] = useState<WorkflowVariable['type']>('string');
  const [newVarValue, setNewVarValue] = useState('');
  const [newVarScope, setNewVarScope] = useState<VariableScope>('execution');

  if (!activeWf) {
    return null;
  }

  const handleAddVar = () => {
    if (!newVarName || newVarName.trim() === '') return;

    let parsedVal: any = newVarValue;
    if (newVarType === 'number') parsedVal = Number(newVarValue) || 0;
    if (newVarType === 'boolean') parsedVal = newVarValue === 'true' || newVarValue === '1';
    if (newVarType === 'json') {
      try {
        parsedVal = JSON.parse(newVarValue);
      } catch {
        parsedVal = {};
      }
    }

    const updatedVars = [
      ...activeWf.variables,
      {
        name: newVarName.trim(),
        type: newVarType,
        value: parsedVal,
        scope: newVarScope,
      },
    ];

    engine.updateWorkflow(activeWf.id, { variables: updatedVars });

    setNewVarName('');
    setNewVarValue('');
  };

  const handleRemoveVar = (index: number) => {
    const updatedVars = activeWf.variables.filter((_, i) => i !== index);
    engine.updateWorkflow(activeWf.id, { variables: updatedVars });
  };

  const handleValueEdit = (index: number, val: string) => {
    const updatedVars = [...activeWf.variables];
    const target = updatedVars[index];

    let parsedVal: any = val;
    if (target.type === 'number') parsedVal = Number(val) || 0;
    if (target.type === 'boolean') parsedVal = val === 'true';
    if (target.type === 'json') {
      try {
        parsedVal = JSON.parse(val);
      } catch {
        parsedVal = val;
      }
    }

    updatedVars[index] = { ...target, value: parsedVal };
    engine.updateWorkflow(activeWf.id, { variables: updatedVars });
  };

  const getScopeColor = (scope: VariableScope) => {
    switch (scope) {
      case 'project':
        return 'primary';
      case 'scene':
        return 'secondary';
      case 'template':
        return 'warning';
      case 'environment':
        return 'error';
      case 'execution':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VarIcon /> Declared Variables
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {activeWf.variables.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: 'center' }}>
          No custom variables declared. Add one below to use it as ${'{name}'} placeholder in configs.
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 300, mb: 3 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Variable Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Default Value</TableCell>
                <TableCell align="right">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeWf.variables.map((v, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <code>${'{'}{v.name}{'}'}</code>
                  </TableCell>
                  <TableCell>
                    <Chip label={v.type.toUpperCase()} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={v.scope.toUpperCase()} size="small" color={getScopeColor(v.scope)} />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="standard"
                      value={typeof v.value === 'object' ? JSON.stringify(v.value) : String(v.value)}
                      onChange={(e) => handleValueEdit(i, e.target.value)}
                      sx={{ fontSize: '0.85rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleRemoveVar(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
        Declare New Variable:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <TextField
          size="small"
          label="Variable Name"
          value={newVarName}
          onChange={(e) => setNewVarName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 150 }}
        />

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={newVarType}
            onChange={(e) => setNewVarType(e.target.value as WorkflowVariable['type'])}
          >
            <MenuItem value="string">String</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
            <MenuItem value="json">JSON Object</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={newVarScope}
            onChange={(e) => setNewVarScope(e.target.value as VariableScope)}
          >
            <MenuItem value="project">Project Scope</MenuItem>
            <MenuItem value="scene">Scene Scope</MenuItem>
            <MenuItem value="template">Template Scope</MenuItem>
            <MenuItem value="environment">Environment Scope</MenuItem>
            <MenuItem value="execution">Execution Scope</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Default Value"
          value={newVarValue}
          onChange={(e) => setNewVarValue(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 150 }}
        />

        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddVar}>
          Add Var
        </Button>
      </Box>
    </Paper>
  );
};
