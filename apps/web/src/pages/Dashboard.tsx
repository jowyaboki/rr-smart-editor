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
  ListItemSecondaryAction,
  Link,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
  ContentCopy as DuplicateIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  AutoAwesome as TemplateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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

  const handleDuplicate = async (id: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${API_URL}/projects/${id}/duplicate`, { method: 'POST' });
    window.location.reload(); // Simple refresh for now
  };

  const handleExport = (project: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", project.name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading projects</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<TemplateIcon />} onClick={() => navigate('/templates')}>
            Templates
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Create Project
          </Button>
        </Box>
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
                      primary={
                        <Link
                          component="button"
                          variant="body1"
                          onClick={() => navigate(`/editor/${project.id}`)}
                          sx={{ textAlign: 'left', fontWeight: 'bold' }}
                        >
                          {project.name}
                        </Link>
                      }
                      secondary={`Last updated: ${new Date(project.updatedAt).toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Open"><IconButton onClick={() => navigate(`/editor/${project.id}`)}><OpenIcon /></IconButton></Tooltip>
                      <Tooltip title="Duplicate"><IconButton onClick={() => handleDuplicate(project.id)}><DuplicateIcon /></IconButton></Tooltip>
                      <Tooltip title="Export"><IconButton onClick={() => handleExport(project)}><ExportIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton onClick={() => handleEdit(project)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton onClick={() => deleteProject.mutate(project.id)}><DeleteIcon /></IconButton></Tooltip>
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
