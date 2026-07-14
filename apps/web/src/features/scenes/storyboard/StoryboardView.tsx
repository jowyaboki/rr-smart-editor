import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  PlayCircleOutline as PlayIcon
} from '@mui/icons-material';
import { useSceneStore } from '../store/sceneStore';
import { SceneService } from '../services/SceneService';
import { SceneNavigationService } from '../services/SceneNavigationService';

export const StoryboardView: React.FC = () => {
  const { storyboard, addScene, removeScene, selectedSceneId, setSelectedSceneId } = useSceneStore();

  if (!storyboard) return <Typography sx={{ p: 4 }}>No storyboard initialized.</Typography>;

  const handleAddScene = () => {
    const nextOrder = storyboard.scenes.length;
    addScene(SceneService.createScene(nextOrder));
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Storyboard</Typography>
        <IconButton color="primary" onClick={handleAddScene}><AddIcon /></IconButton>
      </Box>

      <Grid container spacing={2}>
        {storyboard.scenes.map((scene) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={scene.id}>
            <Card
              onClick={() => setSelectedSceneId(scene.id)}
              sx={{
                position: 'relative',
                border: selectedSceneId === scene.id ? '2px solid #1976d2' : '1px solid #444',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardMedia
                component="img"
                height="120"
                image={scene.thumbnailUrl || 'https://via.placeholder.com/240x135?text=Scene+Preview'}
                alt={scene.metadata.title}
              />
              <Box sx={{ position: 'absolute', top: 5, left: 5 }}>
                <Chip
                  label={scene.order + 1}
                  size="small"
                  sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', height: 20 }}
                />
              </Box>
              <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                <IconButton
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'primary.main' } }}
                    onClick={(e) => {
                        e.stopPropagation();
                        SceneNavigationService.jumpToScene(scene, storyboard.scenes);
                    }}
                >
                  <PlayIcon sx={{ color: 'white', fontSize: 16 }} />
                </IconButton>
              </Box>
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle2" noWrap>{scene.metadata.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(scene.durationFrames / 30)}s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
