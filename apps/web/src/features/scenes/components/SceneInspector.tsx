import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Slider
} from '@mui/material';
import { useSceneStore } from '../store/sceneStore';

export const SceneInspector: React.FC = () => {
  const { storyboard, selectedSceneId, updateScene } = useSceneStore();
  const scene = storyboard?.scenes.find(s => s.id === selectedSceneId);

  if (!scene) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Scene Properties</Typography>

      <TextField
        fullWidth
        size="small"
        label="Title"
        value={scene.metadata.title}
        onChange={(e) => updateScene(scene.id, { metadata: { ...scene.metadata, title: e.target.value } })}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        size="small"
        multiline
        rows={3}
        label="Description"
        value={scene.metadata.description || ''}
        onChange={(e) => updateScene(scene.id, { metadata: { ...scene.metadata, description: e.target.value } })}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={scene.metadata.status}
          label="Status"
          onChange={(e) => updateScene(scene.id, { metadata: { ...scene.metadata, status: e.target.value as any } })}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="in-review">In Review</MenuItem>
          <MenuItem value="ready">Ready</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="caption">Duration (frames)</Typography>
      <Slider
        size="small"
        value={scene.durationFrames}
        min={30} max={900}
        onChange={(_, v) => updateScene(scene.id, { durationFrames: v as number })}
        valueLabelDisplay="auto"
      />
    </Box>
  );
};
