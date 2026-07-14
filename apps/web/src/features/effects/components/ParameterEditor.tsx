import React from 'react';
import { Box, Typography, Slider, TextField } from '@mui/material';
import { EffectParameter } from '@ai-video-editor/shared';

interface ParameterEditorProps {
  parameter: EffectParameter;
  value: any;
  onChange: (value: any) => void;
}

export const ParameterEditor: React.FC<ParameterEditorProps> = ({ parameter, value, onChange }) => {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{parameter.name}</Typography>
      {parameter.type === 'number' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Slider
            size="small"
            value={value}
            min={parameter.min ?? 0}
            max={parameter.max ?? 100}
            step={parameter.step ?? 1}
            onChange={(_, val) => onChange(val)}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption" sx={{ width: 30 }}>{value}</Typography>
        </Box>
      )}
      {parameter.type === 'color' && (
        <TextField
          type="color"
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Box>
  );
};
