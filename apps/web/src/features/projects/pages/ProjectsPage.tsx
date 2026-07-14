import React, { useState } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectDialog } from '../components/NewProjectDialog';
import { SearchBar } from '../components/SearchBar';
import { useProjectStore } from '../store/projectStore';

const ProjectsPage: React.FC = () => {
  const { projects, loading, error, deleteProject, duplicateProject, toggleFavorite } = useProjects();
  const createProject = useProjectStore((state) => state.createProject);
  const renameProject = useProjectStore((state) => state.renameProject);

  const [search, setSearch] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<{ id: string, name: string } | null>(null);
  const [newName, setNewName] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = favoriteOnly ? p.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleCreate = async (data: any) => {
    await createProject(data);
    setNewDialogOpen(false);
  };

  const handleRenameClick = (id: string) => {
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      setProjectToRename({ id, name: p.name });
      setNewName(p.name);
      setRenameDialogOpen(true);
    }
  };

  const handleRenameConfirm = async () => {
    if (projectToRename) {
      await renameProject(projectToRename.id, newName);
      setRenameDialogOpen(false);
    }
  };

  if (loading && projects.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNewDialogOpen(true)}>
          New Project
        </Button>
      </Box>

      <SearchBar
        value={search}
        onChange={setSearch}
        favoriteOnly={favoriteOnly}
        onFavoriteToggle={setFavoriteOnly}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
            <ProjectCard
              project={project}
              onDelete={deleteProject}
              onDuplicate={duplicateProject}
              onToggleFavorite={toggleFavorite}
              onRename={handleRenameClick}
            />
          </Grid>
        ))}
        {filteredProjects.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No projects found.
            </Typography>
          </Grid>
        )}
      </Grid>

      <NewProjectDialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onCreate={handleCreate}
      />

      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            variant="standard"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">Rename</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
