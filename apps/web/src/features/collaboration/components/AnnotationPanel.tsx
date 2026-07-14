import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
} from '@mui/material';
import { Bookmark, Delete, PriorityHigh, Edit } from '@mui/icons-material';
import { useCollaboration } from '../hooks/useCollaboration';

interface Props {
  projectId: string;
}

export const AnnotationPanel: React.FC<Props> = ({ projectId }) => {
  const { annotations, addAnnotation, deleteAnnotation } = useCollaboration(projectId);
  const [label, setLabel] = useState('');
  const [frame, setFrame] = useState(0);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [color, setColor] = useState('#3182ce');

  const handleCreate = () => {
    if (!label) return;
    addAnnotation({
      type: 'marker',
      timeStart: frame,
      label,
      priority,
      color,
      authorId: 'user_editor',
    });
    setLabel('');
    setFrame(0);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'error';
    if (p === 'medium') return 'warning';
    return 'info';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Create Annotation Form */}
      <Paper
        sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Add Timeline Annotation
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Label / Note"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            type="number"
            label="Frame"
            value={frame}
            onChange={(e) => setFrame(Number(e.target.value))}
            sx={{ width: '45%' }}
          />
          <Select
            size="small"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            sx={{ width: '55%' }}
          >
            <MenuItem value="low">Low Priority</MenuItem>
            <MenuItem value="medium">Medium Priority</MenuItem>
            <MenuItem value="high">High Priority</MenuItem>
          </Select>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Marker Color:
          </Typography>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: 36, height: 24 }}
          />
        </Box>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          startIcon={<Bookmark />}
          onClick={handleCreate}
          fullWidth
          disabled={!label}
        >
          Add Marker
        </Button>
      </Paper>

      {/* Annotations List */}
      <Box
        sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        {annotations.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No annotations added to timeline yet.
            </Typography>
          </Box>
        ) : (
          annotations.map((annot) => (
            <Paper
              key={annot.id}
              sx={{
                p: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: `4px solid ${annot.color}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {annot.label}
                </Typography>
                <IconButton size="small" color="error" onClick={() => deleteAnnotation(annot.id)}>
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <Chip
                  label={`Frame ${annot.timeStart}`}
                  size="small"
                  sx={{ fontSize: '0.6rem', height: 18 }}
                />
                <Chip
                  label={annot.priority.toUpperCase()}
                  size="small"
                  color={getPriorityColor(annot.priority) as any}
                  sx={{ fontSize: '0.6rem', height: 18 }}
                />
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};
