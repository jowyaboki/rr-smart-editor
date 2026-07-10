import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTransitionStore } from '../store/transitionStore';

export const TransitionInspector: React.FC = () => {
  const { instances, selectedInstanceId, removeInstance, updateInstance, presets } = useTransitionStore();
  const selectedInstance = instances.find(i => i.id === selectedInstanceId);
  const preset = presets.find(p => p?.id === selectedInstance?.transitionId);

  if (!selectedInstance) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Transition</Typography>
        <IconButton
          color="error"
          size="small"
          onClick={() => removeInstance(selectedInstance.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Typography variant="subtitle2" gutterBottom>Type: {preset?.name}</Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Duration (frames)</Typography>
        <Slider
          size="small"
          value={30} // Linked to settings in a real impl
          min={5}
          max={120}
          valueLabelDisplay="auto"
        />
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Direction</InputLabel>
        <Select label="Direction" value="left">
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="right">Right</MenuItem>
          <MenuItem value="up">Up</MenuItem>
          <MenuItem value="down">Down</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      <Button variant="outlined" fullWidth size="small">
        Preview Transition
      </Button>
    </Box>
  );
};
