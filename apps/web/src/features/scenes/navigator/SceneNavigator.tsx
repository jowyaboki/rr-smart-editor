import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider
} from '@mui/material';
import { Movie as SceneIcon } from '@mui/icons-material';
import { useSceneStore } from '../store/sceneStore';

export const SceneNavigator: React.FC = () => {
  const { storyboard, selectedSceneId, setSelectedSceneId } = useSceneStore();

  if (!storyboard) return null;

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block' }}>Scenes</Typography>
      <List dense>
        {storyboard.scenes.map((scene) => (
          <ListItem
            button
            key={scene.id}
            selected={selectedSceneId === scene.id}
            onClick={() => setSelectedSceneId(scene.id)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}><SceneIcon fontSize="small" /></ListItemIcon>
            <ListItemText
                primary={scene.metadata.title}
                secondary={`${scene.order + 1} • ${scene.durationFrames} frames`}
                primaryTypographyProps={{ variant: 'caption', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption', sx: { fontSize: 9 } }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
