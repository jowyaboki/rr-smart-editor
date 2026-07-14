import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Grid,
  Slider
} from '@mui/material';
import { useChartStore } from '../store/chartStore';

interface ChartInspectorProps {
  clipId: string;
}

export const ChartInspector: React.FC<ChartInspectorProps> = ({ clipId }) => {
  const { charts, updateChart } = useChartStore();
  const chart = charts[clipId];

  if (!chart) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Chart Properties</Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Chart Type</InputLabel>
        <Select
          value={chart.type}
          label="Chart Type"
          onChange={(e) => updateChart(clipId, { type: e.target.value as any })}
        >
          <MenuItem value="bar">Bar Chart</MenuItem>
          <MenuItem value="line">Line Chart</MenuItem>
          <MenuItem value="pie">Pie Chart</MenuItem>
          <MenuItem value="donut">Donut Chart</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>Animation</Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption">Duration (frames)</Typography>
        <Slider
          size="small"
          value={chart.animation.durationFrames}
          min={10} max={120}
          onChange={(_, v) => updateChart(clipId, { animation: { ...chart.animation, durationFrames: v as number } })}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>Layout</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Padding"
            size="small"
            type="number"
            value={chart.padding}
            onChange={(e) => updateChart(clipId, { padding: parseInt(e.target.value) })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
