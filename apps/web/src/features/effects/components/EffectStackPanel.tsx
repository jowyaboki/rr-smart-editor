import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
  Switch,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useEffectStore } from '../store/effectStore';
import { EffectRegistry } from '../services/EffectRegistry';
import { ParameterEditor } from './ParameterEditor';
import { v4 as uuidv4 } from 'uuid';

interface EffectStackPanelProps {
  clipId: string;
}

export const EffectStackPanel: React.FC<EffectStackPanelProps> = ({ clipId }) => {
  const { clipEffects, addEffectToClip, removeEffectFromClip, updateEffectInstance } = useEffectStore();
  const effects = clipEffects[clipId] || [];

  const handleAddEffect = (effectId: string) => {
    const effectDef = EffectRegistry.find(e => e.id === effectId);
    if (!effectDef) return;

    addEffectToClip(clipId, {
      id: uuidv4(),
      effectId,
      enabled: true,
      parameterValues: {},
      animations: [],
      expanded: true
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Effects</Typography>
        <Button
          startIcon={<AddIcon />}
          size="small"
          variant="outlined"
          onClick={() => handleAddEffect('blur')} // Default to blur for demo
        >
          Add
        </Button>
      </Box>

      <List dense>
        {effects.map((inst, index) => {
          const def = EffectRegistry.find(e => e.id === inst.effectId);
          return (
            <Paper key={inst.id} sx={{ mb: 1, bgcolor: 'background.paper', overflow: 'hidden' }}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch
                      size="small"
                      checked={inst.enabled}
                      onChange={(e) => updateEffectInstance(clipId, inst.id, { enabled: e.target.checked })}
                    />
                    <IconButton size="small" onClick={() => removeEffectFromClip(clipId, inst.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <IconButton size="small" onClick={() => updateEffectInstance(clipId, inst.id, { expanded: !inst.expanded })}>
                  {inst.expanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
                <ListItemText primary={def?.name} />
              </ListItem>

              <Collapse in={inst.expanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {def?.parameters.map(param => (
                    <ParameterEditor
                      key={param.id}
                      parameter={param}
                      value={inst.parameterValues[param.id] ?? param.defaultValue}
                      onChange={(val) => updateEffectInstance(clipId, inst.id, {
                        parameterValues: { ...inst.parameterValues, [param.id]: val }
                      })}
                    />
                  ))}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
        {effects.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No effects applied to this clip.
          </Typography>
        )}
      </List>
    </Box>
  );
};

import { Paper } from '@mui/material'; // Redundant but safe for the snippet
