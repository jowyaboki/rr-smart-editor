import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography
} from '@mui/material';
import { Template, TemplateVariable } from '../types';

interface TemplateVariableDialogProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (values: Record<string, any>) => void;
}

export const TemplateVariableDialog: React.FC<TemplateVariableDialogProps> = ({ template, open, onClose, onConfirm }) => {
  const [values, setValues] = useState<Record<string, any>>({});

  if (!template) return null;

  const handleConfirm = () => {
    onConfirm(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Configure Template: {template.metadata.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {template.variables.map((v: TemplateVariable) => (
            <TextField
              key={v.id}
              label={v.label}
              type={v.type === 'number' ? 'number' : 'text'}
              defaultValue={v.defaultValue}
              fullWidth
              onChange={(e) => setValues({ ...values, [v.id]: e.target.value })}
            />
          ))}
          {template.variables.length === 0 && (
            <Typography color="text.secondary">This template has no configurable variables.</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">Create Project</Button>
      </DialogActions>
    </Dialog>
  );
};
