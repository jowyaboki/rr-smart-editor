import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { usePresets } from '../hooks/usePresets';
import { RenderSettings } from '../types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  onExport: (settings: RenderSettings) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, projectName, onExport }) => {
  const { presets } = usePresets();
  const [settings, setSettings] = useState<RenderSettings>({
    filename: `${projectName}_render`,
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
    quality: 80,
    audioEnabled: true,
    transparency: false,
    outputFormat: 'mp4',
  });

  const handlePresetChange = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({ ...prev, ...preset.settings }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Export Video</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Preset"
              select
              fullWidth
              size="small"
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              {presets.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Filename"
              fullWidth
              size="small"
              value={settings.filename}
              onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Resolution"
              value={`${settings.width}x${settings.height}`}
              disabled
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="FPS"
              value={settings.fps}
              disabled
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Format"
              select
              fullWidth
              size="small"
              value={settings.outputFormat}
              onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value as any })}
            >
              <MenuItem value="mp4">MP4</MenuItem>
              <MenuItem value="webm">WebM</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Codec"
              select
              fullWidth
              size="small"
              value={settings.codec}
              onChange={(e) => setSettings({ ...settings, codec: e.target.value as any })}
            >
              <MenuItem value="h264">H.264</MenuItem>
              <MenuItem value="h265">H.265</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onExport(settings)}>Start Render</Button>
      </DialogActions>
    </Dialog>
  );
};
