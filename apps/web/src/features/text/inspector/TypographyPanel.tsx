import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatBold,
  FormatItalic
} from '@mui/icons-material';
import { useTextStore } from '../store/textStore';

interface TypographyPanelProps {
  clipId: string;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ clipId }) => {
  const { textObjects, updateTextObject } = useTextStore();
  const textObj = textObjects[clipId];

  if (!textObj) return null;

  const updateStyle = (updates: any) => {
    updateTextObject(clipId, { style: { ...textObj.style, ...updates } });
  };

  const updateLayout = (updates: any) => {
    updateTextObject(clipId, { layout: { ...textObj.layout, ...updates } });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Typography</Typography>

      <TextField
        fullWidth
        multiline
        label="Content"
        value={textObj.content}
        onChange={(e) => updateTextObject(clipId, { content: e.target.value })}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Font Family</InputLabel>
            <Select value={textObj.style.fontFamily} label="Font Family" onChange={(e) => updateStyle({ fontFamily: e.target.value })}>
              <MenuItem value="Inter, Roboto, Arial">Inter (System)</MenuItem>
              <MenuItem value="serif">Serif</MenuItem>
              <MenuItem value="monospace">Monospace</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption">Size</Typography>
          <Slider
            value={textObj.style.fontSize}
            min={8} max={200}
            onChange={(_, v) => updateStyle({ fontSize: v })}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption">Line Height</Typography>
          <Slider
            value={textObj.style.lineHeight}
            min={0.5} max={3} step={0.1}
            onChange={(_, v) => updateStyle({ lineHeight: v })}
          />
        </Grid>

        <Grid item xs={12}>
          <ToggleButtonGroup
            value={textObj.layout.textAlign}
            exclusive
            size="small"
            onChange={(_, v) => v && updateLayout({ textAlign: v })}
            fullWidth
          >
            <ToggleButton value="left"><FormatAlignLeft /></ToggleButton>
            <ToggleButton value="center"><FormatAlignCenter /></ToggleButton>
            <ToggleButton value="right"><FormatAlignRight /></ToggleButton>
            <ToggleButton value="justify"><FormatAlignJustify /></ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Box>
  );
};
