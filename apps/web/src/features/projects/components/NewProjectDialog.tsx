import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from '@mui/material';

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({ open, onClose, onCreate }) => {
  const [data, setData] = useState({
    name: '',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 300,
    backgroundColor: '#000000',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: name === 'name' || name === 'backgroundColor' ? value : Number(value) }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Project</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField name="name" label="Project Name" fullWidth value={data.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField name="width" label="Width" type="number" fullWidth value={data.width} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField name="height" label="Height" type="number" fullWidth value={data.height} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField name="fps" label="FPS" type="number" fullWidth value={data.fps} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField name="durationInFrames" label="Duration (Frames)" type="number" fullWidth value={data.durationInFrames} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField name="backgroundColor" label="Background Color" type="color" fullWidth value={data.backgroundColor} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onCreate(data)} variant="contained" disabled={!data.name}>Create</Button>
      </DialogActions>
    </Dialog>
  );
};
