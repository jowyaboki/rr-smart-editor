import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRename: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onRename
}) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: project.backgroundColor }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {project.thumbnail ? (
            <CardMedia component="img" image={project.thumbnail} />
          ) : (
            <Typography variant="h6" color="grey.700">No Preview</Typography>
          )}
        </Box>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)' }}
          onClick={() => onToggleFavorite(project.id)}
        >
          {project.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon sx={{ color: 'white' }} />}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>{project.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {project.width}x{project.height} • {project.fps} FPS • {Math.round(project.durationInFrames / project.fps)}s
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Updated: {new Date(project.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<OpenIcon />} onClick={() => navigate(`/editor/${project.id}`)}>Open</Button>
        <Tooltip title="Duplicate"><IconButton size="small" onClick={() => onDuplicate(project.id)}><DuplicateIcon /></IconButton></Tooltip>
        <Tooltip title="Rename"><IconButton size="small" onClick={() => onRename(project.id)}><EditIcon /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" onClick={() => onDelete(project.id)}><DeleteIcon /></IconButton></Tooltip>
      </CardActions>
    </Card>
  );
};
