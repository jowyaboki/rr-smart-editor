import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';

const Dashboard: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: string, name: string } | null>(null);
  const [projectName, setProjectName] = useState('');

  const handleOpen = () => {
    setProjectName('');
    setEditingProject(null);
    setOpen(true);
  };

  const handleEdit = (project: { id: string, name: string }) => {
    setProjectName(project.name);
    setEditingProject(project);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, name: projectName });
    } else {
      createProject.mutate(projectName);
    }
    handleClose();
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading projects</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Create Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Projects</Typography>
            {projects?.length === 0 ? (
              <Typography color="text.secondary">No projects yet. Create one!</Typography>
            ) : (
              <List>
                {projects?.map((project) => (
                  <ListItem key={project.id} divider>
                    <ListItemText
                      primary={project.name}
                      secondary={`Last updated: ${new Date(project.updatedAt).toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEdit(project)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => deleteProject.mutate(project.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Stats</Typography>
            <Typography variant="body2">Total Videos: {projects?.length || 0}</Typography>
            <Typography variant="body2">Storage Used: 0%</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingProject ? 'Rename Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="standard"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!projectName}>
            {editingProject ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
