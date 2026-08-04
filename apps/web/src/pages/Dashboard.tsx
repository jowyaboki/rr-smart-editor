import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
  ContentCopy as DuplicateIcon,
  FileDownload as ExportIcon,
  AutoAwesome as TemplateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '../hooks/useProjects';

import {
  Panel,
  SearchBar,
  EmptyState,
  SkeletonLoader,
  Modal,
  StatusBadge,
  PropertyGrid,
} from '@ai-video-editor/ui';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [search, setSearch] = useState('');

  const handleOpen = () => {
    setProjectName('');
    setEditingProject(null);
    setOpen(true);
  };

  const handleEdit = (project: { id: string; name: string }) => {
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
    window.location.reload();
  };

  const handleExport = (project: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', project.name + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#ffffff' }}>
          Dashboard Loading...
        </Typography>
        <SkeletonLoader rows={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          title="Error Loading Projects"
          description="We encountered an issue communicating with the database. Please verify your connection."
          action={
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </Box>
    );
  }

  const filteredProjects = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Active Projects', value: <StatusBadge status="info" label={String(projects?.length || 0)} /> },
    { label: 'Storage Usage', value: <StatusBadge status="success" label="0% (Offline mode)" /> },
    { label: 'Cluster Workers', value: <StatusBadge status="warning" label="Active" /> },
  ];

  return (
    <Box sx={{ color: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#b2bac2', mt: 0.5 }}>
            Manage sequences, trigger distributed renders, and build automation workflows.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => navigate('/templates')}
            sx={{
              textTransform: 'none',
              borderColor: '#1e293b',
              color: '#ffffff',
              '&:hover': { borderColor: '#90caf9' },
            }}
          >
            Browse Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              textTransform: 'none',
              bgcolor: '#90caf9',
              color: '#0a1929',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#64b5f6' },
            }}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left main pane */}
        <Grid item xs={12} md={8}>
          <Panel title="All Compositions">
            <Box sx={{ mb: 3 }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Filter projects by title..." />
            </Box>

            {filteredProjects?.length === 0 ? (
              <EmptyState
                title="No Compositions Found"
                description={search ? "Try refining your search text." : "Create your very first project to begin timeline editing!"}
                action={
                  !search && (
                    <Button variant="contained" size="small" onClick={handleOpen}>
                      Create Project
                    </Button>
                  )
                }
              />
            ) : (
              <List sx={{ p: 0 }}>
                {filteredProjects?.map((project) => (
                  <ListItem
                    key={project.id}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.02)',
                      mb: 1.5,
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: '#90caf9' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Link
                          component="button"
                          variant="body1"
                          onClick={() => navigate(`/editor/${project.id}`)}
                          sx={{
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            textDecoration: 'none',
                            '&:hover': { color: '#90caf9' },
                          }}
                        >
                          {project.name}
                        </Link>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#b2bac2' }}>
                          Last synchronized: {new Date(project.updatedAt).toLocaleString()}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Open Workspace">
                        <IconButton onClick={() => navigate(`/editor/${project.id}`)} sx={{ color: '#ffffff' }}>
                          <OpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Project">
                        <IconButton onClick={() => handleDuplicate(project.id)} sx={{ color: '#b2bac2' }}>
                          <DuplicateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Composition (JSON)">
                        <IconButton onClick={() => handleExport(project)} sx={{ color: '#b2bac2' }}>
                          <ExportIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rename">
                        <IconButton onClick={() => handleEdit(project)} sx={{ color: '#b2bac2' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Permanently">
                        <IconButton onClick={() => deleteProject.mutate(project.id)} sx={{ color: '#f44336' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Panel>
        </Grid>

        {/* Right Info sidebar */}
        <Grid item xs={12} md={4}>
          <Panel title="System Analytics & Storage">
            <Typography variant="body2" sx={{ color: '#b2bac2', mb: 3 }}>
              Live metrics for self-hosted SQL in-memory router engine.
            </Typography>
            <PropertyGrid properties={stats} />
          </Panel>
        </Grid>
      </Grid>

      {/* Creation/Rename dialog modal */}
      <Modal
        open={open}
        onClose={handleClose}
        title={editingProject ? 'Rename Workspace Project' : 'Create New Composition'}
        actions={
          <>
            <Button onClick={handleClose} sx={{ color: '#b2bac2', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!projectName}
              sx={{ bgcolor: '#90caf9', color: '#0a1929', fontWeight: 'bold', textTransform: 'none' }}
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </>
        }
      >
        <Box sx={{ pt: 1 }}>
          <Typography variant="caption" sx={{ color: '#b2bac2', display: 'block', mb: 1 }}>
            Provide a descriptive name for your timeline sequence.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. Premium Brand Promo V2"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            InputProps={{
              sx: { color: '#ffffff', bgcolor: '#0a1929' },
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
